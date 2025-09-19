<?php
header('Content-Type: application/json');
session_start();
require '../db/connection.php';

if(!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'paciente' || !isset($_SESSION['id_persona'])){
    echo json_encode(['success'=>false,'message'=>'Acceso denegado']);
    exit;
}

$persona_id = $_SESSION['id_persona'];

// Obtener el id_paciente
$stmt = $conn->prepare("SELECT id_paciente FROM paciente WHERE persona_id=?");
$stmt->execute([$persona_id]);
$paciente = $stmt->fetch(PDO::FETCH_ASSOC);

if(!$paciente){
    echo json_encode(['success'=>false,'message'=>'Paciente no encontrado']);
    exit;
}

$paciente_id = $paciente['id_paciente'];

// Obtener solicitudes del paciente
$stmt = $conn->prepare("
    SELECT id_solicitud, estado, fecha_solicitud, fecha_respuesta, motivo
    FROM solicitud_historial
    WHERE paciente_id=?
    ORDER BY fecha_solicitud DESC
");
$stmt->execute([$paciente_id]);
$solicitudes = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['success'=>true,'solicitudes'=>$solicitudes]);
