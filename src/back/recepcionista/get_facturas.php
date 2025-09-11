<?php
require '../db/connection.php';
header('Content-Type: application/json');

try {
    $stmt = $conn->query("
        SELECT f.id_factura, f.paciente_id, f.monto_total, f.estado, p.nombre, p.apellido
        FROM factura f
        JOIN persona p ON f.paciente_id = p.id_persona
    ");
    $facturas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Formatear paciente
    foreach($facturas as &$f) {
        $f['paciente'] = $f['nombre'].' '.$f['apellido'];
    }
    echo json_encode($facturas);
} catch(PDOException $e) {
    echo json_encode([]);
}
