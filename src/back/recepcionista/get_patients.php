<?php
require '../db/connection.php';
header('Content-Type: application/json');

try {
    // Obtener pacientes usando la tabla paciente para devolver id_paciente
    $stmt = $conn->query(
        "SELECT pa.id_paciente, p.id_persona, p.nombre, p.apellido, p.email, p.foto
         FROM paciente pa
         JOIN persona p ON pa.persona_id = p.id_persona
         ORDER BY p.nombre ASC"
    );
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
