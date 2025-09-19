<?php
require '../db/connection.php';
header('Content-Type: application/json');

try {
    $stmt = $conn->query("
        SELECT c.id_cita, c.fecha_hora_inicio, c.fecha_hora_fin, c.estado,
            p.nombre AS paciente_nombre, p.apellido AS paciente_apellido,
            f_p.nombre AS funcionario_nombre, f_p.apellido AS funcionario_apellido,
            s.nombre AS sucursal_nombre
        FROM cita c
        JOIN paciente pa ON c.paciente_id = pa.id_paciente
        JOIN persona p ON pa.persona_id = p.id_persona
        JOIN funcionario f ON c.funcionario_id = f.id_funcionario
        JOIN persona f_p ON f.persona_id = f_p.id_persona
        JOIN sucursal s ON c.sucursal_id = s.id_sucursal
        ORDER BY c.fecha_hora_inicio DESC
    ");
    $citas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "citas" => $citas]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
