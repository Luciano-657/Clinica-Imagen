<?php
header('Content-Type: application/json; charset=utf-8');
session_start();
require __DIR__ . '/../db/connection.php';

$logFile = __DIR__ . '/cita_action.log';
function logMsg($msg) { global $logFile; file_put_contents($logFile, date('c').' '.$msg.PHP_EOL, FILE_APPEND); }

// permisos
$role = $_SESSION['rol'] ?? null;
if (!in_array($role, ['recepcionista','admin'], true)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Acceso denegado']);
    exit;
}

// leer input (JSON preferido)
$raw = file_get_contents('php://input');
$input = json_decode($raw, true);
if (!$input) $input = $_POST;

// datos obligatorios
$id = $input['id'] ?? null;
$action = isset($input['action']) ? strtolower(trim($input['action'])) : null;
if (!$id || !$action) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Faltan id o action']);
    exit;
}

$table = 'solicitud_cita'; // tabla donde se guardan las solicitudes
try {
    // helpers para detección de columnas
    $dbName = $conn->query("SELECT DATABASE()")->fetchColumn();
    $colExists = function($col) use ($conn, $dbName, $table) {
        $s = $conn->prepare("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = :db AND TABLE_NAME = :table AND COLUMN_NAME = :col");
        $s->execute([':db'=>$dbName, ':table'=>$table, ':col'=>$col]);
        return (int)$s->fetchColumn() > 0;
    };

    // detectar columna PK de la tabla (id)
    $idCandidates = ['id','id_solicitud','solicitud_id','id_solicitud_cita','request_id','id_cita'];
    $idCol = null;
    foreach ($idCandidates as $c) { if ($colExists($c)) { $idCol = $c; break; } }
    if (!$idCol) { http_response_code(500); echo json_encode(['success'=>false,'error'=>'No se detectó columna id en solicitud_cita.']); exit; }

    // columnas comunes
    $estadoCol = null;
    foreach (['estado','status','estado_solicitud'] as $c) if ($colExists($c)) { $estadoCol = $c; break; }
    $fechaCol = null;
    foreach (['fecha_hora','fecha','fecha_hora_preferida','fecha_solicitada'] as $c) if ($colExists($c)) { $fechaCol = $c; break; }
    $funcIdCol = null;
    foreach (['funcionario_id','id_funcionario'] as $c) if ($colExists($c)) { $funcIdCol = $c; break; }
    $funcNameCol = null;
    foreach (['funcionario_nombre','funcionario','nombre_funcionario'] as $c) if ($colExists($c)) { $funcNameCol = $c; break; }
    $motivoCol = null;
    foreach (['notas','motivo','reason','descripcion'] as $c) if ($colExists($c)) { $motivoCol = $c; break; }
    $rejectCol = null;
    foreach (['motivo_rechazo','rechazo_motivo','reject_reason'] as $c) if ($colExists($c)) { $rejectCol = $c; break; }

    // comprobar existencia del registro
    $sel = $conn->prepare("SELECT * FROM `$table` WHERE `$idCol` = :id LIMIT 1");
    $sel->execute([':id' => $id]);
    $row = $sel->fetch(PDO::FETCH_ASSOC);
    if (!$row) { http_response_code(404); echo json_encode(['success'=>false,'error'=>'Solicitud no encontrada']); exit; }

    // preparar updates según action
    $updates = [];
    $params = [];

    switch ($action) {
        case 'authorize':
        case 'autorizar':
            if ($estadoCol) { $updates[] = "`$estadoCol` = :estado"; $params[':estado'] = 'autorizada'; }
            else { http_response_code(500); echo json_encode(['success'=>false,'error'=>'No existe columna estado en la tabla.']); exit; }
            break;

        case 'confirm':
        case 'confirmar':
            if ($estadoCol) { $updates[] = "`$estadoCol` = :estado"; $params[':estado'] = 'confirmada'; }
            else { http_response_code(500); echo json_encode(['success'=>false,'error'=>'No existe columna estado en la tabla.']); exit; }
            break;

        case 'reject':
        case 'rechazar':
            $reason = trim($input['reason'] ?? $input['motivo'] ?? '');
            if ($reason === '') { http_response_code(400); echo json_encode(['success'=>false,'error'=>'Se requiere motivo de rechazo']); exit; }
            if ($estadoCol) { $updates[] = "`$estadoCol` = :estado"; $params[':estado'] = 'rechazada'; }
            if ($rejectCol) { $updates[] = "`$rejectCol` = :reason"; $params[':reason'] = $reason; }
            elseif ($motivoCol) { $updates[] = "`$motivoCol` = :reason"; $params[':reason'] = $reason; } // fallback
            break;

        case 'reassign':
        case 'reasignar':
            $new_fecha = $input['new_fecha'] ?? $input['fecha'] ?? null;
            $new_func_id = $input['new_funcionario_id'] ?? $input['funcionario_id'] ?? null;
            if (!$new_fecha && !$new_func_id) { http_response_code(400); echo json_encode(['success'=>false,'error'=>'Falta new_fecha o new_funcionario_id']); exit; }
            if ($new_fecha) {
                if (!$fechaCol) { http_response_code(500); echo json_encode(['success'=>false,'error'=>'No existe columna de fecha en la tabla para reasignar']); exit; }
                $updates[] = "`$fechaCol` = :new_fecha"; $params[':new_fecha'] = $new_fecha;
            }
            if ($new_func_id) {
                if (!$funcIdCol) { http_response_code(500); echo json_encode(['success'=>false,'error'=>'No existe columna funcionario_id en la tabla para reasignar']); exit; }
                $updates[] = "`$funcIdCol` = :new_func"; $params[':new_func'] = $new_func_id;
                // intentar obtener nombre del funcionario si podemos y actualizar columna nombre si existe
                if ($funcNameCol) {
                    // intentar buscar nombre en tablas comunes
                    $name = null;
                    $funcTables = ['funcionarios','funcionario','personal','usuarios','acceso'];
                    foreach ($funcTables as $ft) {
                        $q = $conn->prepare("SELECT * FROM information_schema.TABLES WHERE TABLE_SCHEMA = :db AND TABLE_NAME = :table");
                        $q->execute([':db'=>$dbName, ':table'=>$ft]);
                        if ($q->fetchColumn()) {
                            // intentar obtener nombre/apellido/nom completo
                            $self = $conn->prepare("SELECT * FROM `$ft` WHERE id = :id LIMIT 1");
                            $self->execute([':id' => $new_func_id]);
                            $fr = $self->fetch(PDO::FETCH_ASSOC);
                            if ($fr) {
                                if (!empty($fr['nombre']) && !empty($fr['apellido'])) $name = $fr['nombre'].' '.$fr['apellido'];
                                elseif (!empty($fr['nombre'])) $name = $fr['nombre'];
                                elseif (!empty($fr['full_name'])) $name = $fr['full_name'];
                                break;
                            }
                        }
                    }
                    if ($name !== null) { $updates[] = "`$funcNameCol` = :fn"; $params[':fn'] = $name; }
                }
            }
            // marca como reasignada/autorizar? mantener estado pendiente
            break;

        case 'cancel':
        case 'dar_de_baja':
        case 'baja':
            if ($estadoCol) { $updates[] = "`$estadoCol` = :estado"; $params[':estado'] = 'cancelada'; }
            else { http_response_code(500); echo json_encode(['success'=>false,'error'=>'No existe columna estado en la tabla.']); exit; }
            break;

        default:
            http_response_code(400);
            echo json_encode(['success'=>false,'error'=>'Action no soportada']);
            exit;
    }

    if (empty($updates)) {
        echo json_encode(['success'=>false,'error'=>'Nada que actualizar']);
        exit;
    }

    // ejecutar UPDATE
    $sql = "UPDATE `$table` SET ".implode(', ', $updates)." WHERE `$idCol` = :id LIMIT 1";
    $params[':id'] = $id;
    $upd = $conn->prepare($sql);
    $upd->execute($params);

    if ($upd->rowCount() === 0) {
        // puede que no haya cambiado nada pero existe; devolver success con aviso
        // volver a leer fila para devolver estado actual
        $sel = $conn->prepare("SELECT * FROM `$table` WHERE `$idCol` = :id LIMIT 1");
        $sel->execute([':id' => $id]);
        $row2 = $sel->fetch(PDO::FETCH_ASSOC);
        echo json_encode(['success'=>true,'message'=>'Acción aplicada (sin cambios detectados)','updated'=>$row2]);
        exit;
    }

    // retornar fila actualizada (solo campos relevantes)
    $sel = $conn->prepare("SELECT * FROM `$table` WHERE `$idCol` = :id LIMIT 1");
    $sel->execute([':id' => $id]);
    $updated = $sel->fetch(PDO::FETCH_ASSOC);

    echo json_encode(['success'=>true,'message'=>'Acción ejecutada','updated'=>$updated]);
    exit;

} catch (PDOException $e) {
    logMsg('PDOException: '.$e->getMessage());
    http_response_code(500);
    echo json_encode(['success'=>false,'error'=>'Error SQL: '.$e->getMessage()]);
    exit;
} catch (Exception $e) {
    logMsg('Exception: '.$e->getMessage());
    http_response_code(500);
    echo json_encode(['success'=>false,'error'=>'Error servidor: '.$e->getMessage()]);
    exit;
}
?>