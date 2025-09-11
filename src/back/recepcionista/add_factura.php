<?php
require '../db/connection.php';
header('Content-Type: application/json');

$paciente_id = $_POST['paciente_id'] ?? null;
$monto = $_POST['monto_total'] ?? null;
$estado = $_POST['estado'] ?? 'pendiente';

if(!$paciente_id || !$monto){
    echo json_encode(["success"=>false,"message"=>"Todos los campos son obligatorios"]); exit;
}

try{
    $stmt = $conn->prepare("INSERT INTO factura (paciente_id, monto_total, estado) VALUES (?,?,?)");
    $stmt->execute([$paciente_id,$monto,$estado]);
    echo json_encode(["success"=>true,"message"=>"Factura agregada correctamente"]);
}catch(PDOException $e){
    echo json_encode(["success"=>false,"message"=>"Error: ".$e->getMessage()]);
}
