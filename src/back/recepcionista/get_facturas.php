<?php
require '../db/connection.php';
header('Content-Type: application/json');

try {
    $stmt = $conn->query("
        SELECT f.id_factura, f.monto_total, f.estado, f.fecha_emision,
        p.nombre, p.apellido
        FROM factura f
        JOIN paciente pa ON f.paciente_id = pa.id_paciente
        JOIN persona p ON pa.persona_id = p.id_persona
        ORDER BY f.fecha_emision DESC
    ");
    $facturas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "facturas" => $facturas ?: []
    ]);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => "Error al obtener facturas: " . $e->getMessage()
    ]);
}
