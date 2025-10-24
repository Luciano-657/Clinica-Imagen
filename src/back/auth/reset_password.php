<?php
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 0);

require __DIR__ . '/../db/connection.php';

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!$data) $data = $_POST;

$token = trim($data['token'] ?? '');
$password = trim($data['password'] ?? '');

if (!$token || !$password) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Faltan token o contraseña.']);
    exit;
}
if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'La contraseña debe tener al menos 6 caracteres.']);
    exit;
}

try {
    // Buscar token en password_resets
    $stmt = $conn->prepare("SELECT * FROM password_resets WHERE token = :token LIMIT 1");
    $stmt->execute([':token' => $token]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Token inválido o ya usado.']);
        exit;
    }

    // comprobar expiración sólo si existe la columna en la fila
    if (!empty($row['expires_at']) && strtotime($row['expires_at']) < time()) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Token expirado. Solicite otro enlace.']);
        exit;
    }
    if (!empty($row['created_at'])) {
        $created = strtotime($row['created_at']);
        if ($created !== false && ($created + 3600) < time()) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Token expirado. Solicite otro enlace.']);
            exit;
        }
    }

    $personaId = (int)($row['persona_id'] ?? $row['id_persona'] ?? 0);
    if (!$personaId) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Token sin persona asociada.']);
        exit;
    }

    // Forzar tabla/columna correcta para tu esquema
    $foundTable = 'acceso';
    $foundCol   = 'contrasena_hash';

    // validar existencia tabla/columna
    $dbName = $conn->query("SELECT DATABASE()")->fetchColumn();
    $check = $conn->prepare("
        SELECT COUNT(*) FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = :db AND TABLE_NAME = :table AND COLUMN_NAME = :col
    ");
    $check->execute([':db' => $dbName, ':table' => $foundTable, ':col' => $foundCol]);
    if ((int)$check->fetchColumn() === 0) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => "La columna {$foundCol} no existe en {$foundTable}. Ajusta el nombre o crea la columna."]);
        exit;
    }

    // determinar la columna persona (persona_id o id_persona) en la tabla acceso
    $colsStmt = $conn->prepare("
        SELECT COLUMN_NAME FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = :db AND TABLE_NAME = :table
    ");
    $colsStmt->execute([':db' => $dbName, ':table' => $foundTable]);
    $cols = $colsStmt->fetchAll(PDO::FETCH_COLUMN, 0);

    $personaIdColumn = 'persona_id';
    if (!in_array('persona_id', $cols, true) && in_array('id_persona', $cols, true)) {
        $personaIdColumn = 'id_persona';
    }
    if (!in_array($personaIdColumn, $cols, true)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => "La tabla {$foundTable} no tiene columna persona_id/id_persona."]);
        exit;
    }

    // Hashear contraseña y actualizar
    $hash = password_hash($password, PASSWORD_DEFAULT);

    $updateSql = "UPDATE `$foundTable` SET `$foundCol` = :hash WHERE `$personaIdColumn` = :pid LIMIT 1";
    $upd = $conn->prepare($updateSql);
    $upd->execute([':hash' => $hash, ':pid' => $personaId]);

    if ($upd->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'No se encontró el usuario para actualizar la contraseña.']);
        exit;
    }

    // Borrar token para evitar reutilización
    $del = $conn->prepare("DELETE FROM password_resets WHERE token = :token");
    $del->execute([':token' => $token]);

    echo json_encode(['success' => true, 'message' => 'Contraseña restablecida correctamente.']);
    exit;

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error SQL: ' . $e->getMessage()]);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error servidor: ' . $e->getMessage()]);
    exit;
}
?>