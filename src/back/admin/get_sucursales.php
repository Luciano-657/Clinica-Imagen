<?php
header('Content-Type: application/json');
require '../db/connection.php';

try {
    $stmt = $conn->query("SELECT * FROM sucursal ORDER BY id_sucursal DESC");
    $sucursales = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($sucursales);
} catch(Exception $e){
    echo json_encode([]);
}
