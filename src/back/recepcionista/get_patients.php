<?php
require '../db/connection.php';
header('Content-Type: application/json');

try {
    $stmt = $conn->query("
        SELECT id_persona, nombre, apellido, email, foto 
        FROM persona 
        WHERE id_persona IN (
            SELECT persona_id FROM acceso WHERE rol='paciente'
        )
    ");
    $pacientes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Asegurar que la ruta de la foto sea correcta
    foreach ($pacientes as &$paciente) {
        if (!empty($paciente['foto']) && file_exists($_SERVER['DOCUMENT_ROOT'] . '/' . $paciente['foto'])) {
            $paciente['foto'] = '/' . $paciente['foto'];
        } else {
            // Imagen predeterminada
            $paciente['foto'] = '/front/assets/images/avatar.png';
        }
    }

    echo json_encode($pacientes);
} catch(PDOException $e) {
    echo json_encode(["error" => "Error al obtener pacientes"]);
}
