<?php
header('Content-Type: application/json');
session_start();
require '../db/connection.php';

// Verificar sesión
if (!isset($_SESSION['rol']) || !isset($_SESSION['id_persona'])) {
    echo json_encode(["success" => false, "error" => "No autorizado"]);
    exit;
}

$rol = $_SESSION['rol']; // admin, recepcionista, paciente, funcionario
$id_persona = $_SESSION['id_persona'];

// Verificar que se envió la imagen
if (!isset($_FILES['foto']) || $_FILES['foto']['error'] !== 0) {
    echo json_encode(["success" => false, "error" => "No se envió la imagen o ocurrió un error"]);
    exit;
}

// Validar imagen
if (getimagesize($_FILES['foto']['tmp_name']) === false) {
    echo json_encode(["success" => false, "error" => "El archivo no es una imagen válida"]);
    exit;
}

// Determinar carpeta según rol
$baseDir = __DIR__ . '/../../front/assets/updates/';
$roleDirs = [
    'admin' => 'admin/',
    'recepcionista' => 'recepcionista/',
    'paciente' => 'paciente/',
    'funcionario' => 'funcionario/'
];

if (!isset($roleDirs[$rol])) {
    echo json_encode(["success" => false, "error" => "Rol no reconocido"]);
    exit;
}

$uploadDir = $baseDir . $roleDirs[$rol];
if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

// Buscar foto anterior
$stmt = $conn->prepare("SELECT foto FROM persona WHERE id_persona=?");
$stmt->execute([$id_persona]);
$oldFoto = $stmt->fetchColumn();

// Eliminar foto anterior si existe
if ($oldFoto) {
    $oldPath = __DIR__ . '/../../front/' . $oldFoto;
    if (file_exists($oldPath)) unlink($oldPath);
}

// Guardar nueva imagen
$ext = strtolower(pathinfo($_FILES['foto']['name'], PATHINFO_EXTENSION));
$filename = $rol . '_' . $id_persona . '_' . time() . '.' . $ext; // agregar timestamp para evitar cache
$filepath = $uploadDir . $filename;

if (!move_uploaded_file($_FILES['foto']['tmp_name'], $filepath)) {
    echo json_encode(["success" => false, "error" => "Error al mover la imagen"]);
    exit;
}

// Ruta relativa para frontend
$relativePath = 'front/assets/updates/' . $roleDirs[$rol] . $filename;

// Guardar ruta en DB
$stmt = $conn->prepare("UPDATE persona SET foto=? WHERE id_persona=?");
$stmt->execute([$relativePath, $id_persona]);

echo json_encode([
    "success" => true,
    "message" => "Foto actualizada correctamente",
    "url" => '/' . $relativePath
]);
