<?php
header('Content-Type: application/json');
session_start();
require '../db/connection.php';

// Verificar sesión y rol
if (!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'paciente' || !isset($_SESSION['id_persona'])) {
    echo json_encode(['success' => false, 'message' => 'Acceso denegado.']);
    exit;
}

// Obtener paciente_id a partir de persona_id
$persona_id = $_SESSION['id_persona'];

$stmt = $conn->prepare("SELECT id_paciente FROM paciente WHERE persona_id = ?");
$stmt->execute([$persona_id]);
$paciente = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$paciente) {
    echo json_encode(['success' => false, 'message' => 'No se encontró el paciente.']);
    exit;
}

$paciente_id = $paciente['id_paciente'];

// Obtener motivo enviado
$motivo = trim($_POST['motivo'] ?? '');

if (empty($motivo)) {
    echo json_encode(['success' => false, 'message' => 'El motivo no puede estar vacío.']);
    exit;
}

// Insertar solicitud en la base de datos
try {
    $stmt = $conn->prepare("INSERT INTO solicitud_historial (paciente_id, motivo) VALUES (?, ?)");
    $stmt->execute([$paciente_id, $motivo]);
    echo json_encode(['success' => true, 'message' => 'Solicitud enviada correctamente.']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error al enviar solicitud.']);
}
