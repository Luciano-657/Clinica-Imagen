<?php
header('Content-Type: application/json');
session_start();
require '../db/connection.php';

// Verificar sesión
if (!isset($_SESSION['rol']) || !isset($_SESSION['id_persona'])) {
    echo json_encode(["success" => false, "error" => "No autorizado"]);
    exit;
}

$rol = $_SESSION['rol']; // admin, recepcionista, paciente
$id_persona = $_SESSION['id_persona'];

// Verificar que se envió la imagen
if (!isset($_FILES['foto']) || $_FILES['foto']['error'] !== 0) {
    echo json_encode(["success" => false, "error" => "No se envió la imagen o ocurrió un error"]);
    exit;
}

// Validar imagen
$check = getimagesize($_FILES['foto']['tmp_name']);
if ($check === false) {
    echo json_encode(["success" => false, "error" => "El archivo no es una imagen válida"]);
    exit;
}

// Determinar carpeta según rol
$baseDir = '../../front/assets/updates/';
$roleDirs = [
    'admin' => 'admins/',
    'recepcionista' => 'recepcionistas/',
    'paciente' => 'pacientes/'
];

if (!isset($roleDirs[$rol])) {
    echo json_encode(["success" => false, "error" => "Rol no reconocido"]);
    exit;
}

$uploadDir = $baseDir . $roleDirs[$rol];
if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

// Nombre único de la imagen
$ext = pathinfo($_FILES['foto']['name'], PATHINFO_EXTENSION);
$filename = $rol . '_' . $id_persona . '.' . $ext;
$filepath = $uploadDir . $filename;

// Mover archivo
if (!move_uploaded_file($_FILES['foto']['tmp_name'], $filepath)) {
    echo json_encode(["success" => false, "error" => "Error al mover la imagen"]);
    exit;
}

// Guardar ruta relativa en DB
$relativePath = 'assets/updates/' . $roleDirs[$rol] . $filename;
$stmt = $conn->prepare("UPDATE persona SET foto=? WHERE id_persona=?");
$stmt->execute([$relativePath, $id_persona]);

echo json_encode([
    "success" => true,
    "message" => "Foto actualizada correctamente",
    "url" => $relativePath
]);
