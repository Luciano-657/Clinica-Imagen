<?php
header('Content-Type: application/json');
require '../db/connection.php';

try {
    $nombre = $_POST['nombre'] ?? '';
    $direccion = $_POST['direccion'] ?? '';
    $telefono = $_POST['telefono'] ?? '';
    $horario_apertura = $_POST['horario_apertura'] ?? '';
    $horario_cierre = $_POST['horario_cierre'] ?? '';

    if(!$nombre || !$direccion || !$horario_apertura || !$horario_cierre){
        throw new Exception("Todos los campos obligatorios deben estar llenos.");
    }

    $stmt = $conn->prepare("INSERT INTO sucursal (nombre, direccion, telefono, horario_apertura, horario_cierre) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$nombre, $direccion, $telefono, $horario_apertura, $horario_cierre]);

    echo json_encode(['success'=>true, 'message'=>"Sucursal agregada correctamente"]);
} catch(Exception $e){
    echo json_encode(['success'=>false, 'message'=>$e->getMessage()]);
}
