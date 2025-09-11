<?php
session_start();
require '../db/connection.php';
header('Content-Type: application/json');

// Verificar sesión
if(!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'paciente'){
    echo json_encode(['success'=>false, 'message'=>'No autorizado']);
    exit;
}

if(!isset($_SESSION['id_persona'])){
    echo json_encode(['success'=>false, 'message'=>'ID de usuario no encontrado']);
    exit;
}

$persona_id = $_SESSION['id_persona'];

// Recibir datos del formulario
$nombre = trim($_POST['nombre'] ?? '');
$apellido = trim($_POST['apellido'] ?? '');
$cedula = trim($_POST['cedula'] ?? '');
$fecha_nacimiento = trim($_POST['fecha_nacimiento'] ?? '');
$direccion = trim($_POST['direccion'] ?? '');
$telefono = trim($_POST['telefono'] ?? '');

try {
    // Subida de foto
    $foto_db = null;
    if(isset($_FILES['foto']) && $_FILES['foto']['error'] === 0){
        $ext = pathinfo($_FILES['foto']['name'], PATHINFO_EXTENSION);
        $destino = "../../front/assets/updates/paciente/{$persona_id}.{$ext}";
        if(!is_dir(dirname($destino))){
            mkdir(dirname($destino), 0755, true);
        }
        move_uploaded_file($_FILES['foto']['tmp_name'], $destino);
        $foto_db = "../assets/updates/paciente/{$persona_id}.{$ext}";
    }

    // Preparar SQL dinámico si hay foto
    $sql = "UPDATE persona SET 
                nombre=?, apellido=?, cedula=?, fecha_nacimiento=?, direccion=?, telefono=?";
    $params = [$nombre, $apellido, $cedula, $fecha_nacimiento, $direccion, $telefono];

    if($foto_db){
        $sql .= ", foto=?";
        $params[] = $foto_db;
    }

    $sql .= " WHERE id_persona=?";
    $params[] = $persona_id;

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);

    echo json_encode(['success'=>true,'message'=>'Perfil actualizado correctamente','foto'=>$foto_db ?? '']);
} catch(PDOException $e){
    echo json_encode(['success'=>false,'message'=>'Error al actualizar: '.$e->getMessage()]);
}
