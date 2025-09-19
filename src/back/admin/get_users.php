<?php
session_start();
require $_SERVER['DOCUMENT_ROOT'].'/back/db/connection.php';

if (!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'admin') {
    http_response_code(403);
    exit('Acceso denegado');
}

$admin_id = $_SESSION['id_persona'];

$stmt = $conn->prepare("
    SELECT p.id_persona, p.nombre, p.apellido, p.foto, a.correo, a.rol
    FROM persona p
    LEFT JOIN acceso a ON a.persona_id = p.id_persona
    WHERE p.id_persona != ?
    ORDER BY p.nombre ASC
");
$stmt->execute([$admin_id]);
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($users as &$u) {
    if (!$u['foto'] || !file_exists($_SERVER['DOCUMENT_ROOT'].'/'.$u['foto'])) {
        $u['foto'] = '/front/assets/images/default_user.png';
    } else {
        $u['foto'] = '/'.$u['foto'];
    }
}

echo json_encode($users);
