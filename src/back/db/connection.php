<?php


$host = "db";
$dbname = "mi_app_db";
$user = "chris";
$password = "chris123";

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode([
        "success" => false,
        "error" => "Error de conexión: " . $e->getMessage()
    ]);
    exit;
}
