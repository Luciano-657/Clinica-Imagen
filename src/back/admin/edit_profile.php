<?php
session_start();
require $_SERVER['DOCUMENT_ROOT'].'/back/db/connection.php';
header('Content-Type: application/json');

// Validar sesión
if(!isset($_SESSION['rol']) || $_SESSION['rol']!=='admin'){
    echo json_encode(['success'=>false,'message'=>'No autorizado']);
    exit;
}

$admin_id = $_SESSION['id_persona'];

// Recibir datos del formulario
$nombre = trim($_POST['nombre'] ?? '');
$apellido = trim($_POST['apellido'] ?? '');
$email = trim($_POST['correo'] ?? ''); // coincide con el form
$foto_db = null;

try {
    // Subida de foto
    if(isset($_FILES['foto']) && $_FILES['foto']['error']===0){
        $ext = strtolower(pathinfo($_FILES['foto']['name'], PATHINFO_EXTENSION));
        $destino = $_SERVER['DOCUMENT_ROOT']."/front/assets/updates/admin/{$admin_id}.{$ext}";
        $url_db = "front/assets/updates/admin/{$admin_id}.{$ext}";

        // Crear carpeta si no existe
        if(!is_dir(dirname($destino))){
            mkdir(dirname($destino), 0755, true);
        }

        // Borrar foto anterior si existe
        $stmt = $conn->prepare("SELECT foto FROM persona WHERE id_persona=?");
        $stmt->execute([$admin_id]);
        $oldFoto = $stmt->fetchColumn();
        if($oldFoto && file_exists($_SERVER['DOCUMENT_ROOT'].'/'.$oldFoto)){
            unlink($_SERVER['DOCUMENT_ROOT'].'/'.$oldFoto);
        }

        move_uploaded_file($_FILES['foto']['tmp_name'], $destino);
        $foto_db = $url_db;
    }

    // Actualizar datos en BD
    $sql = "UPDATE persona SET nombre=?, apellido=?, email=?";
    $params = [$nombre, $apellido, $email];

    if($foto_db){
        $sql .= ", foto=?";
        $params[] = $foto_db;
    }

    $sql .= " WHERE id_persona=?";
    $params[] = $admin_id;

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);

    // Si no subió foto, obtener la actual o default
    if(!$foto_db){
        $stmt = $conn->prepare("SELECT foto FROM persona WHERE id_persona=?");
        $stmt->execute([$admin_id]);
        $foto_db = $stmt->fetchColumn() ?: "front/assets/images/default_user.png";
    }

    // Actualizar sesión
    $_SESSION['foto'] = $foto_db;

    echo json_encode([
        'success' => true,
        'message' => 'Perfil actualizado correctamente',
        'foto' => '/'.$foto_db // ruta absoluta desde la raíz
    ]);

} catch(PDOException $e){
    echo json_encode(['success'=>false,'message'=>'Error: '.$e->getMessage()]);
}
