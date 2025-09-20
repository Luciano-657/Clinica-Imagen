<?php
require '../db/connection.php';
header('Content-Type: application/json');

try {
    // Obtener funcionarios desde la tabla funcionario para devolver id_funcionario
    $stmt = $conn->prepare(
        "SELECT f.id_funcionario, p.id_persona, p.nombre, p.apellido, p.email
         FROM funcionario f
         JOIN persona p ON f.persona_id = p.id_persona
         ORDER BY p.nombre ASC"
    );
    $stmt->execute();
    $funcionarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($funcionarios);
} catch(PDOException $e) {
    echo json_encode(["error" => "Error al obtener funcionarios: " . $e->getMessage()]);
}
