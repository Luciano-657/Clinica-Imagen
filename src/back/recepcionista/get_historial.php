<?php
header("Content-Type: application/json");
session_start();
require $_SERVER['DOCUMENT_ROOT'] . '/back/db/connection.php';

if (!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'recepcionista') {
    echo json_encode(["success" => false, "error" => "Acceso denegado"]);
    exit;
}

try {
    // Obtener registros clínicos
    $stmt = $conn->query("
        SELECT rc.id_registro, rc.fecha, rc.tipo, rc.descripcion, rc.observaciones, rc.tratamiento_prescrito,
            p.nombre AS paciente_nombre, p.apellido AS paciente_apellido,
            fp.nombre AS funcionario_nombre, fp.apellido AS funcionario_apellido
        FROM registro_clinico rc
        JOIN historial_medico h ON rc.historial_id = h.id_historial
        JOIN paciente pa ON h.paciente_id = pa.id_paciente
        JOIN persona p ON pa.persona_id = p.id_persona
        LEFT JOIN funcionario f ON rc.cita_id IS NOT NULL 
            JOIN cita c ON rc.cita_id = c.id_cita
            LEFT JOIN persona fp ON f.persona_id = fp.id_persona
        ORDER BY rc.fecha DESC
        LIMIT 50
    ");
    $registros = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Obtener imágenes asociadas a cada registro clínico
    foreach ($registros as &$r) {
        $stmtImg = $conn->prepare("SELECT ruta_archivo, tipo_archivo FROM imagen WHERE estudio_id IS NULL AND id_imagen IN (
            SELECT id_imagen FROM imagen WHERE estudio_id IS NULL
        ) AND id_imagen IS NOT NULL"); // Ajuste para tu lógica
        $stmtImg->execute();
        $r['archivos'] = $stmtImg->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode(["success" => true, "registros" => $registros]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
