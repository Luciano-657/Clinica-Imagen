<?php
session_start();
require $_SERVER['DOCUMENT_ROOT'] . '/back/db/connection.php';

if (!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'recepcionista') {
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['cita_id']) || empty($data['mensaje'])) {
    echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
    exit;
}

try {
    // Obtener el paciente relacionado con la cita
    $stmt = $conn->prepare("
        SELECT p.id_persona, p.nombre, p.email
        FROM cita c
        JOIN persona p ON c.paciente_id = p.id_persona
        WHERE c.id_cita = ?
    ");
    $stmt->execute([$data['cita_id']]);
    $paciente = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$paciente) {
        echo json_encode(['success' => false, 'message' => 'Paciente no encontrado']);
        exit;
    }

    // Guardar mensaje en tabla mensajes
    $stmt = $conn->prepare("
        INSERT INTO mensajes (paciente_id, tipo, contenido, fecha_envio)
        VALUES (?, 'cita', ?, NOW())
    ");
    $stmt->execute([$paciente['id_persona'], $data['mensaje']]);

    echo json_encode(['success' => true, 'message' => 'Mensaje enviado al paciente ' . $paciente['nombre']]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error al enviar mensaje: ' . $e->getMessage()]);
}
?>
