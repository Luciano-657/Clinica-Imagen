<?php
session_start();
require '../db/connection.php';
header('Content-Type: application/json');

if (!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'paciente') {
    echo json_encode([]);
    exit;
}

$persona_id = $_SESSION['id_persona'];

$stmt = $conn->prepare("SELECT id_paciente FROM paciente WHERE persona_id=?");
$stmt->execute([$persona_id]);
$paciente = $stmt->fetch(PDO::FETCH_ASSOC);

if(!$paciente){
    echo json_encode([]);
    exit;
}

$id_paciente = $paciente['id_paciente'];

$stmt = $conn->prepare("SELECT fecha_emision, monto_total, estado FROM factura WHERE paciente_id=? ORDER BY fecha_emision DESC");
$stmt->execute([$id_paciente]);
$facturas = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($facturas);
