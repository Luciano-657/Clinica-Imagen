<?php
require '../db/connection.php';
header('Content-Type: application/json; charset=utf-8');

try {
    // Intentar leer JSON enviado desde el frontend
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);

    // Si no vino JSON (por ejemplo form-urlencoded) usar $_POST como fallback
    if (!is_array($data) || empty($data)) {
        if (!empty($_POST)) {
            $data = $_POST;
        } else {
            // intentar parsear raw body si contiene form-urlencoded
            parse_str($raw, $parsed);
            if (!empty($parsed)) {
                $data = $parsed;
            }
        }
    }

    if (!is_array($data) || empty($data)) {
        echo json_encode(["success" => false, "message" => "No se recibieron datos" ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Tomar campos y asegurar tipos
    $paciente_id   = isset($data['id_paciente']) ? (int)$data['id_paciente'] : 0;
    $funcionario_id= isset($data['id_funcionario']) ? (int)$data['id_funcionario'] : 0;
    $sucursal_id   = isset($data['id_sucursal']) ? (int)$data['id_sucursal'] : 0;
    $fecha_inicio_raw = trim($data['fecha_hora_inicio'] ?? '');
    $fecha_fin_raw    = trim($data['fecha_hora_fin'] ?? '');
    $consultorio_id = (isset($data['consultorio_id']) && $data['consultorio_id'] !== '') ? (int)$data['consultorio_id'] : null;

    if (
    !isset($data['id_paciente']) || $data['id_paciente'] === '' ||
    !isset($data['id_funcionario']) || $data['id_funcionario'] === '' ||
    !isset($data['id_sucursal']) || $data['id_sucursal'] === '' ||
    !isset($data['fecha_hora_inicio']) || $data['fecha_hora_inicio'] === '' ||
    !isset($data['fecha_hora_fin']) || $data['fecha_hora_fin'] === ''
    ) {
        echo json_encode(["success" => false, "message" => "Todos los campos obligatorios"]);
        exit;
    }


    // Normalizar/validar fechas (acepta 'YYYY-MM-DDTHH:MM' del datetime-local)
    try {
        $dtInicio = new DateTime($fecha_inicio_raw);
        $dtFin    = new DateTime($fecha_fin_raw);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Formato de fecha inválido"]);
        exit;
    }

    if ($dtFin <= $dtInicio) {
        echo json_encode(["success" => false, "message" => "La fecha fin debe ser posterior a la fecha inicio"]);
        exit;
    }

    $fecha_inicio = $dtInicio->format('Y-m-d H:i:s');
    $fecha_fin    = $dtFin->format('Y-m-d H:i:s');

    // (Opcional pero recomendable) confirmar que los IDs existen en la DB
    $stmt = $conn->prepare("SELECT 1 FROM paciente WHERE id_paciente = ?");
    $stmt->execute([$paciente_id]);
    if (!$stmt->fetchColumn()) {
        echo json_encode(["success" => false, "message" => "Paciente no encontrado"]);
        exit;
    }

    $stmt = $conn->prepare("SELECT 1 FROM funcionario WHERE id_funcionario = ?");
    $stmt->execute([$funcionario_id]);
    if (!$stmt->fetchColumn()) {
        echo json_encode(["success" => false, "message" => "Funcionario no encontrado"]);
        exit;
    }

    // Insertar cita (usar orden de columnas consistente y estado válido)
    $stmtInsert = $conn->prepare(
        "INSERT INTO cita (paciente_id, sucursal_id, funcionario_id, consultorio_id, fecha_hora_inicio, fecha_hora_fin, estado) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    $estado = 'pendiente';
    $stmtInsert->execute([
        $paciente_id,
        $sucursal_id,
        $funcionario_id,
        $consultorio_id,
        $fecha_inicio,
        $fecha_fin,
        $estado
    ]);

    $idCita = $conn->lastInsertId();
    echo json_encode(["success" => true, "message" => "Cita agregada correctamente", "id_cita" => (int)$idCita], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error al agregar cita: " . $e->getMessage()]);
}
