<?php
session_start();
require $_SERVER['DOCUMENT_ROOT'] . '/back/db/connection.php';

if (!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'recepcionista') {
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['paciente_id']) || empty($data['mensaje'])) {
    echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
    exit;
}

try {
    // Validar paciente
    $stmt = $conn->prepare("SELECT nombre, email FROM persona WHERE id_persona = ?");
    $stmt->execute([$data['paciente_id']]);
    $paciente = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$paciente) {
        echo json_encode(['success' => false, 'message' => 'Paciente no encontrado']);
        exit;
    }

    // Guardar mensaje en tabla mensajes
    $stmt = $conn->prepare("
        INSERT INTO mensajes (paciente_id, tipo, contenido, fecha_envio)
        VALUES (?, 'cumple', ?, NOW())
    ");
    $stmt->execute([$data['paciente_id'], $data['mensaje']]);

    echo json_encode(['success' => true, 'message' => 'Mensaje de cumpleaños enviado a ' . $paciente['nombre']]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error al enviar mensaje: ' . $e->getMessage()]);
}
?>
