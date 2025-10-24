<?php
session_start();
require __DIR__ . '/../db/connection.php';

header('Content-Type: application/json; charset=utf-8');

// permiso básico
if (!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'paciente') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Acceso denegado']);
    exit;
}

// obtener persona -> paciente
$persona_id = $_SESSION['id_persona'] ?? null;
if (!$persona_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Sesión inválida']);
    exit;
}
try {
    $s = $conn->prepare("SELECT id_paciente FROM paciente WHERE persona_id = ? LIMIT 1");
    $s->execute([$persona_id]);
    $p = $s->fetch(PDO::FETCH_ASSOC);
    if (!$p) throw new Exception('Paciente no encontrado');
    $paciente_id = $p['id_paciente'];
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error buscando paciente: '.$e->getMessage()]);
    exit;
}

// leer body (soporta JSON o form-data)
$raw = file_get_contents('php://input');
$input = json_decode($raw, true);
if (!$input) $input = $_POST;

// aceptar ambos nombres de campo por si frontend usa distinto
$fecha_raw = $input['fecha_hora_preferida'] ?? $input['fecha_hora'] ?? $input['fecha'] ?? null;
$id_sucursal = $input['id_sucursal'] ?? $input['sucursal_id'] ?? null;
$motivo = trim($input['motivo'] ?? $input['notas'] ?? '');
$func_pref = trim($input['funcionario_nombre'] ?? $input['profesional_preferencia'] ?? '');

// validaciones
if (empty($id_sucursal) || empty($fecha_raw)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Faltan id_sucursal o fecha_hora_preferida']);
    exit;
}

// normalizar datetime-local (YYYY-MM-DDTHH:MM -> YYYY-MM-DD HH:MM:SS)
function normalizeDatetime($s) {
    if (!$s) return null;
    $s = trim($s);
    if (strpos($s, 'T') !== false) {
        $s = str_replace('T', ' ', $s);
        if (strlen($s) === 16) $s .= ':00';
    }
    return $s;
}
$fecha_hora = normalizeDatetime($fecha_raw);

// detectar si existe columna funcionario_nombre en la tabla solicitud_cita
try {
    $dbName = $conn->query("SELECT DATABASE()")->fetchColumn();
    $colCheck = $conn->prepare("
        SELECT COUNT(*) FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = :db AND TABLE_NAME = 'solicitud_cita' AND COLUMN_NAME = 'funcionario_nombre'
    ");
    $colCheck->execute([':db' => $dbName]);
    $hasFuncionarioNombre = ((int)$colCheck->fetchColumn() > 0);
} catch (Exception $e) {
    $hasFuncionarioNombre = false;
}

// construir e insertar
try {
    if ($hasFuncionarioNombre) {
        $sql = "INSERT INTO solicitud_cita (paciente_id, sucursal_id, fecha_hora, notas, funcionario_nombre)
                VALUES (:paciente_id, :sucursal_id, :fecha_hora, :notas, :funcionario_nombre)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':paciente_id' => $paciente_id,
            ':sucursal_id' => $id_sucursal,
            ':fecha_hora' => $fecha_hora,
            ':notas' => $motivo ?: null,
            ':funcionario_nombre' => $func_pref !== '' ? $func_pref : null
        ]);
    } else {
        // guarda la preferencia dentro de notas si no existe columna
        $combinedNotas = $motivo;
        if ($func_pref !== '') {
            if ($combinedNotas !== '') $combinedNotas .= "\nPreferencia: " . $func_pref;
            else $combinedNotas = "Preferencia: " . $func_pref;
        }
        $sql = "INSERT INTO solicitud_cita (paciente_id, sucursal_id, fecha_hora, notas)
                VALUES (:paciente_id, :sucursal_id, :fecha_hora, :notas)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':paciente_id' => $paciente_id,
            ':sucursal_id' => $id_sucursal,
            ':fecha_hora' => $fecha_hora,
            ':notas' => $combinedNotas ?: null
        ]);
    }

    $newId = $conn->lastInsertId();
    echo json_encode(['success' => true, 'message' => 'Solicitud creada', 'id' => $newId]);
    exit;
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al guardar: '.$e->getMessage()]);
    exit;
}
?>
