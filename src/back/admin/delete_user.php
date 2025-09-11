<?php
require '../db/connection.php';

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? null;
header('Content-Type: application/json'); // siempre devolver JSON
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING); // ocultar notices y warnings
if (!$id) {
    echo json_encode(["success" => false, "message" => "ID no recibido"]);
    exit;
}

// Verificar rol
$stmtCheck = $conn->prepare("SELECT rol FROM acceso WHERE persona_id=?");
$stmtCheck->execute([$id]);
$rol = $stmtCheck->fetchColumn();
if ($rol === 'admin') {
    echo json_encode(["success" => false, "message" => "No se puede eliminar al administrador"]);
    exit;
}

try {
    // Borrar acceso primero
    $stmt = $conn->prepare("DELETE FROM acceso WHERE persona_id=?");
    $stmt->execute([$id]);

    // Borrar paciente si existe
    $stmt = $conn->prepare("DELETE FROM paciente WHERE persona_id=?");
    $stmt->execute([$id]);

    // Borrar persona
    $stmt = $conn->prepare("DELETE FROM persona WHERE id_persona=?");
    $stmt->execute([$id]);

    echo json_encode(["success" => true, "message" => "Usuario eliminado"]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>
