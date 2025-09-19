<?php
require '../db/connection.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
if(!$data) { 
    echo json_encode(["success"=>false,"message"=>"No se recibieron datos"]); 
    exit; 
}

$nombre = trim($data['nombre'] ?? '');
$apellido = trim($data['apellido'] ?? '');
$email = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');

if(empty($nombre) || empty($apellido) || empty($email) || empty($password)){
    echo json_encode(["success"=>false,"message"=>"Todos los campos son obligatorios"]); 
    exit;
}

try{
    // Verificar si ya existe el email
    $stmtCheck = $conn->prepare("SELECT id_persona FROM persona WHERE email=?");
    $stmtCheck->execute([$email]);
    if($stmtCheck->rowCount() > 0){
        echo json_encode(["success"=>false,"message"=>"El email ya está registrado"]); 
        exit;
    }

    // Insertar persona
    $stmt = $conn->prepare("INSERT INTO persona (nombre, apellido, email) VALUES (?,?,?)");
    $stmt->execute([$nombre,$apellido,$email]);
    $id_persona = $conn->lastInsertId();

    // Insertar acceso con hash de contraseña
    $hash = password_hash($password, PASSWORD_BCRYPT);
    $stmt2 = $conn->prepare("INSERT INTO acceso (persona_id, correo, contrasena_hash, rol) VALUES (?,?,?,?)");
    $stmt2->execute([$id_persona, $email, $hash, 'paciente']);

    // Insertar paciente
    $stmt3 = $conn->prepare("INSERT INTO paciente (persona_id) VALUES (?)");
    $stmt3->execute([$id_persona]);

    // Asignar foto predeterminada
    $defaultFoto = 'front/assets/images/avatar.jpg';
    $stmt4 = $conn->prepare("UPDATE persona SET foto=? WHERE id_persona=?");
    $stmt4->execute([$defaultFoto, $id_persona]);

    echo json_encode([
        "success" => true,
        "message" => "Paciente agregado correctamente",
        "id_persona" => $id_persona,
        "foto" => $defaultFoto
    ]);

}catch(PDOException $e){
    echo json_encode(["success"=>false,"message"=>"Error: ".$e->getMessage()]);
}
