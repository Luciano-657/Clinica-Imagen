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

// Obtener historial
$stmt = $conn->prepare("SELECT rc.fecha, rc.tipo, rc.descripcion, rc.observaciones, rc.tratamiento_prescrito
                        FROM registro_clinico rc
                        JOIN historial_medico h ON rc.historial_id=h.id_historial
                        WHERE h.paciente_id=? AND rc.visible_para_pacientes=1
                        ORDER BY rc.fecha DESC");
$stmt->execute([$id_paciente]);
$historial = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($historial);
