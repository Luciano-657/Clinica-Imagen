<?php
require '../db/connection.php';
header('Content-Type: application/json');

$cita_id = $_GET['cita_id'] ?? null;
if(!$cita_id){ echo json_encode([]); exit; }

try {
    $stmt = $conn->prepare("SELECT mensaje, creado_at FROM mensajes_cita WHERE cita_id=? ORDER BY creado_at ASC");
    $stmt->execute([$cita_id]);
    $mensajes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($mensajes);
} catch(PDOException $e){
    echo json_encode([]);
}
