<?php
header("Content-Type: application/json");
session_start();
require $_SERVER['DOCUMENT_ROOT'] . '/back/db/connection.php';

// Protección por rol
if (!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'recepcionista') {
    echo json_encode(["success" => false, "error" => "Acceso denegado"]);
    exit;
}

try {
    $sql = "
        SELECT 
            c.id_cita,
            c.fecha_inicio,
            c.fecha_fin,
            p.nombre AS paciente_nombre,
            p.apellido AS paciente_apellido,
            f.nombre AS funcionario_nombre,
            f.apellido AS funcionario_apellido
        FROM cita c
        INNER JOIN paciente pa ON c.paciente_id = pa.id_paciente
        INNER JOIN persona p ON pa.persona_id = p.id_persona
        INNER JOIN funcionario fu ON c.funcionario_id = fu.id_funcionario
        INNER JOIN persona f ON fu.persona_id = f.id_persona
        WHERE c.id_cita NOT IN (SELECT cita_id FROM historial_medico)
        ORDER BY c.fecha_inicio DESC
    ";

    $stmt = $conn->query($sql);
    $citas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "citas" => $citas]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
