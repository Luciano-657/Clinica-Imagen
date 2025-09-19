<?php
session_start();
require '../db/connection.php';

header('Content-Type: application/json');

if (!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'paciente') {
    echo json_encode(['success' => false, 'message' => 'Acceso no autorizado']);
    exit;
}

$persona_id = $_SESSION['id_persona'];

// Obtener el id del paciente
$stmt = $conn->prepare("SELECT id_paciente FROM paciente WHERE persona_id=?");
$stmt->execute([$persona_id]);
$paciente = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$paciente) {
    echo json_encode(['success' => false, 'message' => 'Paciente no encontrado']);
    exit;
}

$paciente_id = $paciente['id_paciente'];

// Traer historiales médicos con sus registros
$stmt = $conn->prepare("
    SELECT hm.id_historial, rc.id_registro, rc.fecha, rc.tipo, rc.descripcion, rc.observaciones, rc.tratamiento_prescrito
    FROM historial_medico hm
    LEFT JOIN registro_clinico rc ON hm.id_historial = rc.historial_id
    WHERE hm.paciente_id = ?
    ORDER BY rc.fecha DESC
");
$stmt->execute([$paciente_id]);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

$historiales = [];

// Agrupar registros por historial
foreach ($rows as $row) {
    $historial_id = $row['id_historial'];
    if (!isset($historiales[$historial_id])) {
        $historiales[$historial_id] = [
            'registros' => []
        ];
    }
    if ($row['id_registro']) {
        $historiales[$historial_id]['registros'][] = [
            'fecha' => $row['fecha'],
            'tipo' => $row['tipo'],
            'descripcion' => $row['descripcion'],
            'observaciones' => $row['observaciones'],
            'tratamiento_prescrito' => $row['tratamiento_prescrito']
        ];
    }
}

// Reindexar para enviar como array
$historiales = array_values($historiales);

echo json_encode(['success' => true, 'historiales' => $historiales]);
