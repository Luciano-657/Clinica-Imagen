<?php
header('Content-Type: application/json');
require '../../back/db/connection.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['success' => false, 'error' => 'Método no permitido']);
        exit;
    }

    $paciente_id = $_POST['paciente_id'] ?? null;
    $monto_total = $_POST['monto_total'] ?? null;
    $estado = $_POST['estado'] ?? 'pendiente';

    if (!$paciente_id || !$monto_total) {
        echo json_encode(['success' => false, 'error' => 'Faltan datos']);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO factura (paciente_id, monto_total, estado) 
                            VALUES (?, ?, ?)");
    $stmt->execute([$paciente_id, $monto_total, $estado]);

    echo json_encode(['success' => true, 'message' => 'Factura agregada correctamente']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Error al agregar factura: ' . $e->getMessage()]);
}
