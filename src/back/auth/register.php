<?php

header('Content-Type: application/json');
require '../db/connection.php';

$data = json_decode(file_get_contents('php://input'), true);

$nombre = trim($data['nombre'] ?? '');
$email = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');

if (!$nombre || !$email || !$password) {
    echo json_encode(["success" => false, "error" => "Faltan datos"]);
    exit;
}

try {
    // Revisar si el correo ya existe
    $stmt = $conn->prepare("SELECT id_persona FROM persona WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->rowCount() > 0) {
        echo json_encode(["success" => false, "error" => "El correo ya está registrado"]);
        exit;
    }

    // Insertar en persona
    $stmt = $conn->prepare("INSERT INTO persona (nombre, email) VALUES (?, ?)");
    $stmt->execute([$nombre, $email]);
    $persona_id = $conn->lastInsertId();

    // Insertar en acceso (contraseña hasheada)
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO acceso (persona_id, correo, contrasena_hash) VALUES (?, ?, ?)");
    $stmt->execute([$persona_id, $email, $hash]);

    echo json_encode(["success" => true]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
