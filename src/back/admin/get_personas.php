<?php
require '../db/connection.php';
header('Content-Type: application/json');

try {
    $stmt = $conn->prepare("
        SELECT f.id_funcionario, p.nombre, p.apellido, p.email, p.foto,
        f.matricula_profesional, f.tipo_funcionario, s.nombre AS sucursal
        FROM funcionario f
        JOIN persona p ON f.persona_id = p.id_persona
        JOIN sucursal s ON f.sucursal_id = s.id_sucursal
        ORDER BY p.nombre
    ");
    $stmt->execute();
    $funcionarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "data" => $funcionarios]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
