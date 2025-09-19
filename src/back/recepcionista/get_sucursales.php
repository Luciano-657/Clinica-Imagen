<?php
require '../db/connection.php';
header('Content-Type: application/json');

try {
    // Obtener todas las sucursales activas
    $stmt = $conn->prepare("
        SELECT id_sucursal, nombre, direccion
        FROM sucursal
        ORDER BY nombre ASC
    ");
    $stmt->execute();
    $sucursales = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($sucursales);
} catch(PDOException $e) {
    echo json_encode(["error" => "Error al obtener sucursales: " . $e->getMessage()]);
}
