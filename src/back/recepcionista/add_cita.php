<?php
require '../db/connection.php';
header('Content-Type: application/json');

// Obtener los datos enviados (JSON)
$data = json_decode(file_get_contents("php://input"), true);
if(!$data) {
    echo json_encode(["success"=>false,"message"=>"No se recibieron datos"]);
    exit;
}

$paciente_id = trim($data['paciente_id'] ?? '');
$funcionario_persona_id = trim($data['funcionario_id'] ?? '');
$sucursal_id = trim($data['sucursal_id'] ?? '');
$fecha_inicio = trim($data['fecha_hora_inicio'] ?? '');
$fecha_fin = trim($data['fecha_hora_fin'] ?? '');
$consultorio_id = $data['consultorio_id'] ?? null; // opcional si tu tabla tiene default

if(empty($paciente_id) || empty($funcionario_persona_id) || empty($sucursal_id) || empty($fecha_inicio) || empty($fecha_fin)){
    echo json_encode(["success"=>false,"message"=>"Todos los campos obligatorios"]);
    exit;
}

try{
    // Obtener id_paciente real desde persona_id
    $stmtPaciente = $conn->prepare("SELECT id_paciente FROM paciente WHERE persona_id = ?");
    $stmtPaciente->execute([$paciente_id]);
    $id_paciente_real = $stmtPaciente->fetchColumn();
    if(!$id_paciente_real){
        echo json_encode(["success"=>false,"message"=>"Paciente no encontrado"]);
        exit;
    }

    // Obtener id_funcionario real desde persona_id
    $stmtFuncionario = $conn->prepare("SELECT id_funcionario FROM funcionario WHERE persona_id = ?");
    $stmtFuncionario->execute([$funcionario_persona_id]);
    $id_funcionario_real = $stmtFuncionario->fetchColumn();
    if(!$id_funcionario_real){
        echo json_encode(["success"=>false,"message"=>"Funcionario no encontrado"]);
        exit;
    }

    // Insertar cita
    $stmtInsert = $conn->prepare("
        INSERT INTO cita (paciente_id, funcionario_id, sucursal_id, fecha_hora_inicio, fecha_hora_fin, consultorio_id)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmtInsert->execute([
        $id_paciente_real,
        $id_funcionario_real,
        $sucursal_id,
        $fecha_inicio,
        $fecha_fin,
        $consultorio_id // si es nullable en la DB
    ]);

    echo json_encode(["success"=>true,"message"=>"Cita agregada correctamente"]);
}catch(PDOException $e){
    echo json_encode(["success"=>false,"message"=>"Error al agregar cita: ".$e->getMessage()]);
}
?>
