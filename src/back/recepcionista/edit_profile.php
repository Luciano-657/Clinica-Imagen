<?php
session_start();
require '../db/connection.php';
header('Content-Type: application/json');

$recep_id = $_SESSION['id_persona'] ?? null;
if (!$recep_id) {
    echo json_encode(["success" => false, "message" => "Sesión inválida"]);
    exit;
}

$nombre   = trim($_POST['nombre'] ?? '');
$apellido = trim($_POST['apellido'] ?? '');
$email    = trim($_POST['email'] ?? '');
$telefono = trim($_POST['telefono'] ?? '');
$foto_path = null;

try {
    // ---------------- Subir foto si existe ----------------
    if (!empty($_FILES['foto']['name']) && $_FILES['foto']['error'] === 0) {
        $allowedExts = ['jpg','jpeg','png','webp'];
        $ext = strtolower(pathinfo($_FILES['foto']['name'], PATHINFO_EXTENSION));

        if (!in_array($ext, $allowedExts)) {
            echo json_encode(["success" => false, "message" => "Formato de imagen no permitido"]);
            exit;
        }

        $uploadDir = __DIR__ . "/../../front/assets/updates/recepcionista/";
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

        $fileName = $recep_id . "." . $ext;
        $targetFile = $uploadDir . $fileName;

        if (!move_uploaded_file($_FILES['foto']['tmp_name'], $targetFile)) {
            echo json_encode(["success" => false, "message" => "Error al subir la foto"]);
            exit;
        }

        // Ruta relativa para guardar en DB
        $foto_path = "front/assets/updates/recepcionista/" . $fileName;
    }

    // ---------------- Actualizar datos ----------------
    $sql = "UPDATE persona SET nombre=?, apellido=?, email=?, telefono=?";
    $params = [$nombre, $apellido, $email, $telefono];

    if ($foto_path) {
        $sql .= ", foto=?";
        $params[] = $foto_path;
    }

    $sql .= " WHERE id_persona=?";
    $params[] = $recep_id;

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);

    echo json_encode([
        "success" => true,
        "message" => "Perfil actualizado correctamente",
        "foto" => $foto_path
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error al actualizar perfil: " . $e->getMessage()
    ]);
}
