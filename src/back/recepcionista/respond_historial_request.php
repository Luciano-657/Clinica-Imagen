<?php
session_start();
require '../db/connection.php';

if (!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'recepcionista') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Acceso no autorizado']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$id_solicitud = $data['id_solicitud'] ?? null;
$estado = $data['estado'] ?? null;

if (!$id_solicitud || !in_array($estado, ['enviado','rechazado'])) {
    echo json_encode(['success' => false, 'error' => 'Datos inválidos']);
    exit;
}

try {
    // Obtener la solicitud
    $stmt = $conn->prepare("SELECT paciente_id FROM solicitud_historial WHERE id_solicitud = ?");
    $stmt->execute([$id_solicitud]);
    $solicitud = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$solicitud) {
        echo json_encode(['success' => false, 'error' => 'Solicitud no encontrada']);
        exit;
    }

    $paciente_id = $solicitud['paciente_id'];

    if ($estado === 'enviado') {
        // Verificar si ya existe historial_medico para el paciente
        $stmt = $conn->prepare("SELECT id_historial FROM historial_medico WHERE paciente_id = ?");
        $stmt->execute([$paciente_id]);
        $historial = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$historial) {
            // Crear historial médico vacío
            $stmt = $conn->prepare("INSERT INTO historial_medico (paciente_id, created_at, updated_at) VALUES (?, NOW(), NOW())");
            $stmt->execute([$paciente_id]);
        }
    }

    // Actualizar la solicitud
    $stmt = $conn->prepare("UPDATE solicitud_historial SET estado = ?, recepcionista_id = ?, fecha_respuesta = NOW() WHERE id_solicitud = ?");
    $stmt->execute([$estado, $_SESSION['funcionario_id'] ?? null, $id_solicitud]);

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
