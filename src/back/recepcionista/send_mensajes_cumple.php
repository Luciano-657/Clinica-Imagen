<?php
require '../db/connection.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$mensaje = $data['mensaje'] ?? '';

if(!$mensaje){ echo json_encode(["success"=>false,"message"=>"El mensaje no puede estar vacío"]); exit; }

try{
    // Simulación de envío
    echo json_encode(["success"=>true,"message"=>"Mensajes de cumpleaños enviados a todos los pacientes"]);
}catch(PDOException $e){
    echo json_encode(["success"=>false,"message"=>"Error: ".$e->getMessage()]);
}
