<?php
session_start();
require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/hybridauth.php';

use Hybridauth\Hybridauth;

$providerName = $_GET['provider'] ?? null;
if (!$providerName) {
    die('Proveedor no especificado');
}

// Guardamos el proveedor en sesión
$_SESSION['provider'] = $providerName;

$config = require __DIR__ . '/hybridauth.php';

try {
    $hybridauth = new Hybridauth($config);
    $adapter = $hybridauth->getAdapter($providerName);

    // Redirige al login del proveedor
    $adapter->authenticate();

} catch (\Exception $e) {
    echo 'Error: ' . $e->getMessage();
}
