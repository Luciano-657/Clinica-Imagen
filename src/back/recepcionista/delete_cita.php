<?php
header('Content-Type: application/json; charset=utf-8');
session_start();
require __DIR__ . '/../db/connection.php';

if (!in_array($_SESSION['rol'] ?? '', ['recepcionista','admin'], true)) {
    http_response_code(403); echo json_encode(['success'=>false,'error'=>'Acceso denegado']); exit;
}

$raw = file_get_contents('php://input');
$in = json_decode($raw, true) ?: $_POST;
$id = $in['id_cita'] ?? $in['id'] ?? null;
if (!$id) { http_response_code(400); echo json_encode(['success'=>false,'error'=>'Falta id_cita']); exit; }

try {
    // marcar como cancelada si existe columna 'estado', si no eliminar físicamente
    $db = $conn->query("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cita'")->fetchAll(PDO::FETCH_COLUMN);
    if (in_array('estado', $db, true)) {
        $u = $conn->prepare("UPDATE cita SET estado = :st WHERE id_cita = :id LIMIT 1");
        $u->execute([':st'=>'cancelada', ':id'=>$id]);
    } else {
        $d = $conn->prepare("DELETE FROM cita WHERE id_cita = :id LIMIT 1");
        $d->execute([':id'=>$id]);
    }
    echo json_encode(['success'=>true,'message'=>'Cita dada de baja']);
    exit;
} catch (Exception $e) {
    http_response_code(500); echo json_encode(['success'=>false,'error'=>$e->getMessage()]); exit;
}
?>