<?php
header('Content-Type: application/json');
session_start();
require '../db/connection.php';

// Verificar sesión y rol
if (!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'paciente' || !isset($_SESSION['id_persona'])) {
    echo json_encode(['success' => false, 'aprobado' => false, 'message' => 'No autorizado.']);
    exit;
}

try {
    // Obtener id_paciente usando persona_id
    $persona_id = $_SESSION['id_persona'];
    $stmt = $conn->prepare("SELECT id_paciente FROM paciente WHERE persona_id = ?");
    $stmt->execute([$persona_id]);
    $paciente = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$paciente) {
        echo json_encode(['success' => false, 'aprobado' => false, 'message' => 'Paciente no encontrado.']);
        exit;
    }

    $paciente_id = $paciente['id_paciente'];

    // Consultar si hay una solicitud aprobada
    $stmt = $conn->prepare("
        SELECT estado 
        FROM solicitud_historial
        WHERE paciente_id = ? 
        ORDER BY fecha_respuesta DESC 
        LIMIT 1
    ");
    $stmt->execute([$paciente_id]);
    $solicitud = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($solicitud && $solicitud['estado'] === 'aprobado') {
        echo json_encode(['success' => true, 'aprobado' => true]);
    } else {
        echo json_encode(['success' => true, 'aprobado' => false]);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'aprobado' => false, 'message' => 'Error en el servidor.']);
}
