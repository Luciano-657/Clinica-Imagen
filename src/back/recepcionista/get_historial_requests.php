<?php
session_start();
require '../db/connection.php';

if (!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'recepcionista') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Acceso no autorizado']);
    exit;
}

try {
    $stmt = $conn->prepare("
        SELECT sh.id_solicitud, sh.paciente_id, p.nombre AS paciente_nombre, p.apellido AS paciente_apellido,
            sh.estado, sh.fecha_solicitud, sh.fecha_respuesta, sh.motivo, sh.recepcionista_id
        FROM solicitud_historial sh
        INNER JOIN paciente pa ON sh.paciente_id = pa.id_paciente
        INNER JOIN persona p ON pa.persona_id = p.id_persona
        WHERE sh.estado = 'pendiente'
        ORDER BY sh.fecha_solicitud DESC
    ");
    $stmt->execute();
    $solicitudes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'solicitudes' => $solicitudes]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
