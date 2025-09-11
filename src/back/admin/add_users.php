<?php
require '../db/connection.php';
header('Content-Type: application/json'); // Siempre devolver JSON
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING); // Ocultar notices y warnings

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "No se recibieron datos"]);
    exit;
}

$nombre = trim($data['nombre'] ?? '');
$apellido = trim($data['apellido'] ?? '');
$email = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');
$rol = trim($data['rol'] ?? '');

if (empty($nombre) || empty($apellido) || empty($email) || empty($password) || empty($rol)) {
    echo json_encode(["success" => false, "message" => "Todos los campos son obligatorios"]);
    exit;
}

try {
    // Verificar si ya existe el email
    $stmtCheck = $conn->prepare("SELECT id_persona FROM persona WHERE email=?");
    $stmtCheck->execute([$email]);
    if ($stmtCheck->rowCount() > 0) {
        echo json_encode(["success" => false, "message" => "El email ya está registrado"]);
        exit;
    }

    // Insertar persona
    $stmt = $conn->prepare("INSERT INTO persona (nombre, apellido, email) VALUES (?, ?, ?)");
    $stmt->execute([$nombre, $apellido, $email]);
    $id_persona = $conn->lastInsertId();

    // Insertar acceso
    $hash = password_hash($password, PASSWORD_BCRYPT);
    $stmt2 = $conn->prepare("INSERT INTO acceso (persona_id, correo, contrasena_hash, rol) VALUES (?, ?, ?, ?)");
    $stmt2->execute([$id_persona, $email, $hash, $rol]);

    // Insertar en paciente si aplica
    if ($rol === "paciente") {
        $stmt3 = $conn->prepare("INSERT INTO paciente (persona_id) VALUES (?)");
        $stmt3->execute([$id_persona]);
    }

    echo json_encode(["success" => true, "message" => "Usuario agregado correctamente"]);
} catch (PDOException $e) {
    // Devuelve solo el mensaje del error, sin HTML
    echo json_encode(["success" => false, "message" => "Error al agregar usuario: " . $e->getMessage()]);
}
