<?php
require '../db/connection.php';
header('Content-Type: application/json');

try {
    $stmt = $conn->query("SELECT id_persona, nombre, apellido FROM persona WHERE id_persona IN (SELECT persona_id FROM acceso WHERE rol IN ('administrador','recepcionista'))");
    $funcionarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($funcionarios);
} catch(PDOException $e) {
    echo json_encode([]);
}
