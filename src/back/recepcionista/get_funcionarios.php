<?php
require '../db/connection.php';
header('Content-Type: application/json');

try {
    // Obtener solo los funcionarios
    $stmt = $conn->prepare("
        SELECT p.id_persona, p.nombre, p.apellido, p.email
        FROM persona p
        INNER JOIN acceso a ON p.id_persona = a.persona_id
        WHERE a.rol = 'funcionario'
        ORDER BY p.nombre ASC
    ");
    $stmt->execute();
    $funcionarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($funcionarios);
} catch(PDOException $e) {
    echo json_encode(["error" => "Error al obtener funcionarios: " . $e->getMessage()]);
}
