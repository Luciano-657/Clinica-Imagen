<?php
session_start();
require '../../back/db/connection.php';
header('Content-Type: application/json; charset=utf-8');

try {
    $nombre   = trim($_POST['nombre'] ?? '');
    $apellido = trim($_POST['apellido'] ?? '');
    $email    = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if (!$nombre || !$apellido || !$email || !$password) {
        echo json_encode(["success" => false, "error" => "Todos los campos son obligatorios"]);
        exit;
    }

    // Verificar si ya existe correo
    $stmt = $conn->prepare("SELECT id_acceso FROM acceso WHERE correo = ?");
    $stmt->execute([$email]);
    if ($stmt->rowCount() > 0) {
        echo json_encode(["success" => false, "error" => "El correo ya está registrado"]);
        exit;
    }

    // Insertar en persona
    $stmt = $conn->prepare("INSERT INTO persona (nombre, apellido, email) VALUES (?, ?, ?)");
    $stmt->execute([$nombre, $apellido, $email]);
    $persona_id = $conn->lastInsertId();

    // Insertar en acceso
    $hash = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $conn->prepare("INSERT INTO acceso (persona_id, correo, contrasena_hash, rol) VALUES (?, ?, ?, 'paciente')");
    $stmt->execute([$persona_id, $email, $hash]);

    // Insertar en paciente
    $stmt = $conn->prepare("INSERT INTO paciente (persona_id) VALUES (?)");
    $stmt->execute([$persona_id]);

    echo json_encode(["success" => true, "mensaje" => "Paciente agregado correctamente"]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => "Error en el servidor: " . $e->getMessage()]);
}