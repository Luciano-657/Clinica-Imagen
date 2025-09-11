<?php
require '../db/connection.php';
header('Content-Type: application/json');

try {
    $stmt = $conn->query("SELECT id_sucursal, nombre FROM sucursal");
    $sucursales = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($sucursales);
} catch(PDOException $e) {
    echo json_encode([]);
}
