<?php
require '../db/connection.php';
header('Content-Type: application/json');

try {
    $stmt = $conn->query("SELECT id_persona, nombre, apellido, email FROM persona WHERE id_persona IN (SELECT persona_id FROM acceso WHERE rol='paciente')");
    $pacientes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($pacientes);
} catch(PDOException $e) {
    echo json_encode([]);
}
