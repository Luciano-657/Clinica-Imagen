<?php
header('Content-Type: application/json; charset=utf-8');
session_start();
require __DIR__ . '/../db/connection.php';

if (!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'recepcionista') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Acceso denegado']);
    exit;
}

try {
    $sql = "
        SELECT sc.*, pa.id_paciente,
               p.nombre AS paciente_nombre, p.apellido AS paciente_apellido,
               s.nombre AS sucursal_nombre
        FROM solicitud_cita sc
        JOIN paciente pa ON sc.paciente_id = pa.id_paciente
        JOIN persona p ON pa.persona_id = p.id_persona
        LEFT JOIN sucursal s ON sc.sucursal_id = s.id_sucursal
        WHERE sc.estado = 'pendiente'
        ORDER BY sc.fecha_solicitud DESC
    ";
    $stmt = $conn->query($sql);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // helper para detectar si una cadena parece un nombre (letras, espacios, acentos, corto)
    $isLikelyName = function($s) {
        if ($s === null) return false;
        $s = trim($s);
        if ($s === '') return false;
        if (mb_strlen($s) > 40) return false;
        return (bool)preg_match('/^[\p{L}\s\'\.-]{2,40}$/u', $s);
    };

    foreach ($rows as &$r) {
        $r['paciente_nombre_completo'] = trim(($r['paciente_nombre'] ?? '') . ' ' . ($r['paciente_apellido'] ?? ''));

        $fechaVal = $r['fecha_hora'] ?? $r['fecha_solicitud'] ?? null;
        if ($fechaVal) {
            $ts = strtotime($fechaVal);
            $r['fecha_hora'] = $ts ? date('Y-m-d H:i:s', $ts) : $fechaVal;
        } else {
            $r['fecha_hora'] = null;
        }

        // asegurar funcionario_nombre: primero la columna
        $r['funcionario_nombre'] = trim((string)($r['funcionario_nombre'] ?? ''));

        // 1) intentar extraer "Preferencia: ..." desde notas
        if ($r['funcionario_nombre'] === '') {
            $notas = (string)($r['notas'] ?? '');
            if ($notas !== '') {
                if (preg_match('/Preferencia\s*:\s*(.+)/iu', $notas, $m)) {
                    $r['funcionario_nombre'] = trim($m[1]);
                    // opcional: quitar línea de notas si quieres
                } elseif (preg_match('/Prefiere\s*:\s*(.+)/iu', $notas, $m2)) {
                    $r['funcionario_nombre'] = trim($m2[1]);
                } elseif ($isLikelyName($notas)) {
                    // 2) si notas parece un nombre corto, considerarla preferencia
                    $r['funcionario_nombre'] = trim($notas);
                    // opcional: dejar notas vacías o mantenerla; aquí la mantenemos en motivo también
                }
            }
        }

        // 3) si aún vacío, intentar resolver por funcionario_id si existe
        if ($r['funcionario_nombre'] === '') {
            $funcId = $r['funcionario_id'] ?? $r['id_funcionario'] ?? null;
            if ($funcId) {
                try {
                    $q = $conn->prepare("
                        SELECT per.nombre, per.apellido
                        FROM funcionario f
                        JOIN persona per ON f.persona_id = per.id_persona
                        WHERE f.id_funcionario = :fid OR f.id = :fid
                        LIMIT 1
                    ");
                    $q->execute([':fid' => $funcId]);
                    $fr = $q->fetch(PDO::FETCH_ASSOC);
                    if ($fr) $r['funcionario_nombre'] = trim(($fr['nombre'] ?? '') . ' ' . ($fr['apellido'] ?? ''));
                } catch (Exception $e) {
                    // noop
                }
            }
        }

        if (!empty($r['estado'])) $r['estado'] = strtolower($r['estado']);
        $r['motivo'] = $r['notas'] ?? null;
    }
    unset($r);

    echo json_encode(['success' => true, 'solicitudes' => $rows], JSON_UNESCAPED_UNICODE);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    exit;
}
?>
