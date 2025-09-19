<?php
session_start();
require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/hybridauth.php';
require_once __DIR__ . '/../db/connection.php';

use Hybridauth\Hybridauth;

if (!isset($_SESSION['provider'])) {
    die("Proveedor no especificado");
}

$providerName = $_SESSION['provider'];
$config = require __DIR__ . '/hybridauth.php';

try {
    $hybridauth = new Hybridauth($config);
    $adapter = $hybridauth->getAdapter($providerName);

    if (!$adapter->isConnected()) {
    $adapter->authenticate(); // fuerza refresh del token
    }

    $userProfile = $adapter->getUserProfile();


    $email   = $userProfile->email;
    $nombre  = $userProfile->firstName ?? '';
    $apellido = $userProfile->lastName ?? '';
    $foto    = $userProfile->photoURL ?? null;
    $providerId = $userProfile->identifier;

    // Buscar usuario en la BD
    $stmt = $conn->prepare("
        SELECT p.id_persona, a.rol 
        FROM persona p
        JOIN acceso a ON p.id_persona = a.persona_id
        WHERE a.provider = ? AND a.provider_id = ?
        LIMIT 1
    ");
    $stmt->execute([$providerName, $providerId]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) {
        // Verificar si existe por email
        $stmt = $conn->prepare("SELECT id_persona FROM persona WHERE email=? LIMIT 1");
        $stmt->execute([$email]);
        $persona = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$persona) {
            // Crear nueva persona
            $stmt = $conn->prepare("INSERT INTO persona (nombre, apellido, email, foto) VALUES (?, ?, ?, ?)");
            $stmt->execute([$nombre, $apellido, $email, $foto]);
            $personaId = $conn->lastInsertId();
        } else {
            $personaId = $persona['id_persona'];
        }

        // Crear acceso con provider
        $stmt = $conn->prepare("
            INSERT INTO acceso (persona_id, correo, rol, provider, provider_id)
            VALUES (?, ?, 'paciente', ?, ?)
        ");
        $stmt->execute([$personaId, $email, $providerName, $providerId]);

        $rol = "paciente";
    } else {
        $personaId = $usuario['id_persona'];
        $rol = $usuario['rol'];
    }

    // Guardar en sesión
    $_SESSION['id_persona'] = $personaId;
    $_SESSION['rol'] = $rol;

    // Redirigir al panel correspondiente
    switch ($rol) {
        case 'admin':
            header("Location: /front/panels/admin.php");
            break;
        case 'recepcionista':
            header("Location: /front/panels/recepcionista.php");
            break;
        default:
            header("Location: /front/panels/paciente.php");
            break;
    }
    exit;

} catch (\Exception $e) {
    echo "Error en autenticación: " . $e->getMessage();
}
