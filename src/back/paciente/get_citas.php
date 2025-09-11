<?php
session_start();
require '../db/connection.php';
header('Content-Type: application/json');

if (!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'paciente') {
    echo json_encode([]);
    exit;
}

$persona_id = $_SESSION['id_persona'];

// Obtener id_paciente
$stmt = $conn->prepare("SELECT id_paciente FROM paciente WHERE persona_id=?");
$stmt->execute([$persona_id]);
$paciente = $stmt->fetch(PDO::FETCH_ASSOC);

if(!$paciente){
    echo json_encode([]);
    exit;
}

$id_paciente = $paciente['id_paciente'];

// Traer citas
$stmt = $conn->prepare("SELECT c.fecha_hora_inicio, c.fecha_hora_fin, c.estado, c.notas, s.nombre AS sucursal 
                        FROM cita c 
                        JOIN sucursal s ON c.sucursal_id=s.id_sucursal 
                        WHERE c.paciente_id=? ORDER BY c.fecha_hora_inicio DESC");
$stmt->execute([$id_paciente]);
$citas = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($citas);
