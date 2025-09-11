<?php
header('Content-Type: application/json');
session_start();
require '../db/connection.php';

// Verificación de rol admin
if (!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'admin') {
    echo json_encode(["success" => false, "error" => "No autorizado"]);
    exit;
}

// Recibir datos del formulario
$nombre = trim($_POST['nombre'] ?? '');
$apellido = trim($_POST['apellido'] ?? '');
$correo = trim($_POST['correo'] ?? '');
$rol = trim($_POST['rol'] ?? '');
$contrasena = trim($_POST['contrasena'] ?? '');

if (!$nombre || !$apellido || !$correo || !$rol || !$contrasena) {
    echo json_encode(["success" => false, "error" => "Faltan datos"]);
    exit;
}

try {
    // Revisar si el correo ya existe en persona
    $stmt = $conn->prepare("SELECT id_persona FROM persona WHERE email = ?");
    $stmt->execute([$correo]);
    if ($stmt->rowCount() > 0) {
        echo json_encode(["success" => false, "error" => "El correo ya está registrado"]);
        exit;
    }

    // Insertar en persona
    $stmt = $conn->prepare("INSERT INTO persona (nombre, apellido, email) VALUES (?, ?, ?)");
    $stmt->execute([$nombre, $apellido, $correo]);
    $persona_id = $conn->lastInsertId();

    // Insertar en acceso con contraseña hasheada
    $hash = password_hash($contrasena, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO acceso (persona_id, correo, contrasena_hash, rol) VALUES (?, ?, ?, ?)");
    $stmt->execute([$persona_id, $correo, $hash, $rol]);

    // Según el rol, insertar en paciente o funcionario
    if ($rol === 'paciente') {
        $stmt = $conn->prepare("INSERT INTO paciente (persona_id) VALUES (?)");
        $stmt->execute([$persona_id]);
    } elseif ($rol === 'recepcionista') {
        // Para recepcionista se insertaría en funcionario con datos mínimos
        // Fecha de contratación = hoy, sucursal_id = 1 (puedes cambiar según tu estructura)
        $stmt = $conn->prepare("INSERT INTO funcionario (persona_id, fecha_contratacion, matricula_profesional, sucursal_id, tipo_funcionario) VALUES (?, CURDATE(), 'N/A', 1, 'administrativo')");
        $stmt->execute([$persona_id]);
    }

    echo json_encode(["success" => true, "message" => "Usuario creado correctamente"]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
