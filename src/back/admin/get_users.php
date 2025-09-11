<?php
require '../db/connection.php';
session_start();

header('Content-Type: application/json'); // siempre devolver JSON
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING); // ocultar notices y warnings
$current_admin_id = $_SESSION['id_persona'] ?? 0;

$stmt = $conn->prepare("
    SELECT p.id_persona AS id, p.nombre, p.apellido, p.email, p.telefono, p.foto, a.rol 
    FROM persona p 
    JOIN acceso a ON a.persona_id = p.id_persona
    WHERE a.rol != 'admin' OR p.id_persona != ?
");
$stmt->execute([$current_admin_id]);

$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

header('Content-Type: application/json');
echo json_encode($users);
?>
