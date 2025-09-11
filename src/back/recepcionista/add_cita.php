<?php
require '../db/connection.php';
header('Content-Type: application/json');

$paciente_id = $_POST['paciente_id'] ?? null;
$sucursal_id = $_POST['sucursal_id'] ?? null;
$funcionario_id = $_POST['funcionario_id'] ?? null;
$inicio = $_POST['fecha_hora_inicio'] ?? null;
$fin = $_POST['fecha_hora_fin'] ?? null;

if(!$paciente_id || !$sucursal_id || !$funcionario_id || !$inicio || !$fin){
    echo json_encode(["success"=>false,"message"=>"Todos los campos son obligatorios"]); exit;
}

try{
    $stmt = $conn->prepare("INSERT INTO cita (paciente_id, sucursal_id, funcionario_id, fecha_hora_inicio, fecha_hora_fin) VALUES (?,?,?,?,?)");
    $stmt->execute([$paciente_id,$sucursal_id,$funcionario_id,$inicio,$fin]);
    echo json_encode(["success"=>true,"message"=>"Cita agregada correctamente"]);
}catch(PDOException $e){
    echo json_encode(["success"=>false,"message"=>"Error: ".$e->getMessage()]);
}
