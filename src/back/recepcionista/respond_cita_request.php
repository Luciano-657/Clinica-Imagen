<?php
session_start();
ini_set('display_errors', 0);
header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/../db/connection.php';

// Verificar sesión/rol
if (!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'recepcionista') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Acceso denegado']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!$data) $data = $_POST;

$id = isset($data['id_solicitud']) ? (int)$data['id_solicitud'] : 0;
$accion = $data['accion'] ?? ($data['estado'] ?? '');

if (!$id || !in_array($accion, ['aceptar','rechazar','aceptada','rechazada'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Parámetros inválidos']);
    exit;
}

try {
    // Obtener la solicitud
    $stmt = $conn->prepare("SELECT * FROM solicitud_cita WHERE id_solicitud = ?");
    $stmt->execute([$id]);
    $sol = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$sol) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Solicitud no encontrada']);
        exit;
    }

    if ($accion === 'rechazar' || $accion === 'rechazada') {
        $u = $conn->prepare("UPDATE solicitud_cita SET estado = 'rechazada' WHERE id_solicitud = ?");
        $u->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Solicitud rechazada']);
        exit;
    }

    // Acción: aceptar -> crear cita mínima y marcar solicitud como aceptada
    $fecha_inicio = (new DateTime($sol['fecha_hora_preferida']))->format('Y-m-d H:i:s');
    $fecha_fin_dt = new DateTime($sol['fecha_hora_preferida']);
    $fecha_fin_dt->modify('+1 hour'); // duración por defecto 1 hora
    $fecha_fin = $fecha_fin_dt->format('Y-m-d H:i:s');

    // Determinar funcionario_id correctamente:
    $funcionario_id = null;

    // Si hay usuario en sesión, buscar su id_funcionario (tabla funcionario tiene persona_id)
    if (isset($_SESSION['id_persona']) && $_SESSION['id_persona']) {
        $personaId = (int)$_SESSION['id_persona'];
        $q = $conn->prepare("SELECT id_funcionario FROM funcionario WHERE persona_id = ? LIMIT 1");
        $q->execute([$personaId]);
        $f = $q->fetch(PDO::FETCH_ASSOC);
        if ($f && isset($f['id_funcionario'])) {
            $funcionario_id = (int)$f['id_funcionario'];
        }
    }

    // Si no se encontró, intentar asignar cualquier funcionario existente (fallback)
    if (!$funcionario_id) {
        $q2 = $conn->query("SELECT id_funcionario FROM funcionario LIMIT 1");
        $any = $q2->fetch(PDO::FETCH_ASSOC);
        if ($any && isset($any['id_funcionario'])) {
            $funcionario_id = (int)$any['id_funcionario'];
        }
    }

    // Si aún no hay funcionario disponible, devolver error claro para no violar FK
    if (!$funcionario_id) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'No hay funcionarios disponibles. Crea un registro en la tabla funcionario o asigna un funcionario al usuario en sesión.'
        ]);
        exit;
    }

    // Insertar en tabla cita usando el id_funcionario correcto
    $ins = $conn->prepare("
        INSERT INTO cita (paciente_id, sucursal_id, funcionario_id, consultorio_id, fecha_hora_inicio, fecha_hora_fin, estado)
        VALUES (:paciente_id, :sucursal_id, :funcionario_id, NULL, :inicio, :fin, 'pendiente')
    ");
    $ins->execute([
        ':paciente_id'   => $sol['paciente_id'],
        ':sucursal_id'   => $sol['sucursal_id'] ?: null,
        ':funcionario_id'=> $funcionario_id,
        ':inicio'        => $fecha_inicio,
        ':fin'           => $fecha_fin
    ]);
    $id_cita = (int)$conn->lastInsertId();

    // Actualizar estado de la solicitud
    $u = $conn->prepare("UPDATE solicitud_cita SET estado = 'aceptada' WHERE id_solicitud = ?");
    $u->execute([$id]);

    echo json_encode(['success' => true, 'message' => 'Solicitud aceptada y cita creada', 'id_cita' => $id_cita], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}