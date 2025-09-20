<?php
session_start();
require '../db/connection.php';
header('Content-Type: application/json');

if(!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'admin'){
    echo json_encode(["success"=>false, "message"=>"No autorizado"]);
    exit;
}

try {
    $nombre = $_POST['nombre'];
    $apellido = $_POST['apellido'];
    $correo = $_POST['correo'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    $tipo = $_POST['tipo_funcionario'];
    $sucursal_id = $_POST['sucursal_id'];
    $matricula = $_POST['matricula'] ?? null;

    // Subida de foto
    $fotoPath = null;
    if(isset($_FILES['foto']) && $_FILES['foto']['error'] === 0){
        $ext = pathinfo($_FILES['foto']['name'], PATHINFO_EXTENSION);
        $filename = 'func_' . uniqid() . '.' . $ext;
        $uploadDir = 'front/assets/updates/funcionarios/';
        if(!is_dir($_SERVER['DOCUMENT_ROOT'].'/'.$uploadDir)){
            mkdir($_SERVER['DOCUMENT_ROOT'].'/'.$uploadDir, 0777, true);
        }
        $filePath = $uploadDir.$filename;
        move_uploaded_file($_FILES['foto']['tmp_name'], $_SERVER['DOCUMENT_ROOT'].'/'.$filePath);
        $fotoPath = $filePath;
    }

    // Insertar persona (sin password, porque va en acceso)
    $stmt = $conn->prepare("INSERT INTO persona(nombre, apellido, email, foto) VALUES (?, ?, ?, ?)");
    $stmt->execute([$nombre, $apellido, $correo, $fotoPath]);
    $persona_id = $conn->lastInsertId();

    // Insertar en acceso (credenciales)
    $stmtAcceso = $conn->prepare("INSERT INTO acceso(persona_id, correo, contrasena_hash, rol) VALUES (?, ?, ?, ?)");
    $stmtAcceso->execute([$persona_id, $correo, $password, 'funcionario']);

    // Insertar funcionario
    $stmt2 = $conn->prepare("INSERT INTO funcionario(persona_id, matricula_profesional, tipo_funcionario, sucursal_id, fecha_contratacion) VALUES (?, ?, ?, ?, CURDATE())");
    $stmt2->execute([$persona_id, $matricula, $tipo, $sucursal_id]);

    echo json_encode(["success"=>true, "message"=>"Funcionario agregado correctamente"]);

} catch(PDOException $e){
    echo json_encode(["success"=>false, "message"=>$e->getMessage()]);
}