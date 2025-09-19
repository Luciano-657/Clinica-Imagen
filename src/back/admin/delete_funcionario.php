<?php
session_start();
require '../db/connection.php';
header('Content-Type: application/json');

if (!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'admin') {
    echo json_encode(["success" => false, "message" => "Acceso denegado"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$id_funcionario = $data['id_funcionario'] ?? null;
$persona_id = $data['persona_id'] ?? null;

if (!$id_funcionario || !$persona_id) {
    echo json_encode(["success"=>false,"message"=>"Datos incompletos"]);
    exit;
}

try {
    // Eliminar funcionario
    $stmt = $conn->prepare("DELETE FROM funcionario WHERE id_funcionario=?");
    $stmt->execute([$id_funcionario]);

    // Eliminar acceso
    $stmt = $conn->prepare("DELETE FROM acceso WHERE persona_id=?");
    $stmt->execute([$persona_id]);

    // Opcional: eliminar persona
    $stmt = $conn->prepare("DELETE FROM persona WHERE id_persona=?");
    $stmt->execute([$persona_id]);

    echo json_encode(["success"=>true,"message"=>"Funcionario eliminado correctamente"]);
} catch (Exception $e) {
    echo json_encode(["success"=>false,"message"=>$e->getMessage()]);
}
