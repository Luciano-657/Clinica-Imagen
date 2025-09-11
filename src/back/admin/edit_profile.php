<?php
session_start();
require '../db/connection.php';
header('Content-Type: application/json');

$admin_id = $_SESSION['id_persona'] ?? null;
if (!$admin_id) {
    echo json_encode(["success" => false, "message" => "Sesión inválida"]);
    exit;
}

$nombre = trim($_POST['nombre'] ?? '');
$apellido = trim($_POST['apellido'] ?? '');
$telefono = trim($_POST['telefono'] ?? '');
$foto_path = null;

try {
    // ---------------- Subir foto si existe ----------------
    if (!empty($_FILES['foto']['name']) && $_FILES['foto']['error'] === 0) {
        $uploadDir = __DIR__ . "/../../front/assets/updates/admin/";
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

        $ext = strtolower(pathinfo($_FILES['foto']['name'], PATHINFO_EXTENSION));
        $fileName = $admin_id . "." . $ext;
        $targetFile = $uploadDir . $fileName;

        if (!move_uploaded_file($_FILES['foto']['tmp_name'], $targetFile)) {
            echo json_encode(["success" => false, "message" => "Error al subir la foto"]);
            exit;
        }

        // Ruta relativa para frontend
        $foto_path = "front/assets/updates/admin/" . $fileName;
    }

    // ---------------- Actualizar datos ----------------
    $sql = "UPDATE persona SET nombre=?, apellido=?, telefono=?";
    $params = [$nombre, $apellido, $telefono];

    if ($foto_path) {
        $sql .= ", foto=?";
        $params[] = $foto_path;
    }

    $sql .= " WHERE id_persona=?";
    $params[] = $admin_id;

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
