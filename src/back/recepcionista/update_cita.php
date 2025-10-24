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

$fields = [];
$params = [];
if (isset($in['id_funcionario'])) { $fields[] = 'funcionario_id = :fid'; $params[':fid'] = $in['id_funcionario'] ?: null; }
if (isset($in['id_sucursal']))   { $fields[] = 'sucursal_id = :sid'; $params[':sid'] = $in['id_sucursal'] ?: null; }
if (isset($in['fecha_hora_inicio'])) { $fields[] = 'fecha_hora_inicio = :fini'; $params[':fini'] = $in['fecha_hora_inicio'] ?: null; }
if (isset($in['fecha_hora_fin']))   { $fields[] = 'fecha_hora_fin = :ffin'; $params[':ffin'] = $in['fecha_hora_fin'] ?: null; }

if (empty($fields)) { echo json_encode(['success'=>false,'error'=>'Nada que actualizar']); exit; }

try {
    $sql = "UPDATE cita SET " . implode(', ', $fields) . " WHERE id_cita = :id LIMIT 1";
    $params[':id'] = $id;
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    echo json_encode(['success'=>true,'message'=>'Cita actualizada']);
    exit;
} catch (Exception $e) {
    http_response_code(500); echo json_encode(['success'=>false,'error'=>$e->getMessage()]); exit;
}
?>
