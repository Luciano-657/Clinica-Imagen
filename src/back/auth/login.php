<?php

header('Content-Type: application/json');
require '../db/connection.php';

$data = json_decode(file_get_contents('php://input'), true);

$email = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');

if (!$email || !$password) {
    echo json_encode(["success" => false, "error" => "Faltan datos"]);
    exit;
}

try {
    // Obtener acceso
    $stmt = $conn->prepare("SELECT a.contrasena_hash, p.id_persona, p.nombre, p.email
                            FROM acceso a
                            JOIN persona p ON a.persona_id = p.id_persona
                            WHERE a.correo = ?");
    $stmt->execute([$email]);

    if ($stmt->rowCount() === 0) {
        echo json_encode(["success" => false, "error" => "Correo o contraseña incorrectos"]);
        exit;
    }

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (password_verify($password, $user['contrasena_hash'])) {
        echo json_encode([
            "success" => true,
            "user" => [
                "id" => $user['id_persona'],
                "nombre" => $user['nombre'],
                "email" => $user['email']
            ]
        ]);
    } else {
        echo json_encode(["success" => false, "error" => "Correo o contraseña incorrectos"]);
    }

} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
