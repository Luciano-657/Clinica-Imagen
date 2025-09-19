<?php
require '../db/connection.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
if(!$data) {
    echo json_encode(["success"=>false,"message"=>"No se recibieron datos"]);
    exit;
}

$id_cita = $data['id_cita'] ?? null;
$estado = $data['estado'] ?? null;
$nueva_fecha = $data['nueva_fecha'] ?? null;

if(!$id_cita || !$estado){
    echo json_encode(["success"=>false,"message"=>"Datos incompletos"]);
    exit;
}

try{
    if($estado === "reagendada" && $nueva_fecha){
        $stmt = $conn->prepare("UPDATE cita SET estado=?, fecha_hora_inicio=?, fecha_hora_fin=? WHERE id_cita=?");
        // Ajusta fecha fin si deseas agregar la duración de la cita
        $fecha_fin = date('Y-m-d H:i:s', strtotime($nueva_fecha . ' +1 hour'));
        $stmt->execute([$estado, $nueva_fecha, $fecha_fin, $id_cita]);
    } else {
        $stmt = $conn->prepare("UPDATE cita SET estado=? WHERE id_cita=?");
        $stmt->execute([$estado, $id_cita]);
    }
    echo json_encode(["success"=>true,"message"=>"Cita actualizada correctamente"]);
}catch(PDOException $e){
    echo json_encode(["success"=>false,"message"=>"Error al actualizar cita: ".$e->getMessage()]);
}
?>
