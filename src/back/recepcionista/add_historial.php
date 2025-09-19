<?php
header("Content-Type: application/json");
session_start();
require $_SERVER['DOCUMENT_ROOT'] . '/back/db/connection.php';

if (!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'recepcionista') {
    echo json_encode(["success" => false, "error" => "Acceso denegado"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "error" => "Método no permitido"]);
    exit;
}

try {
    $cita_id = $_POST['cita_id'] ?? null;
    $descripcion = $_POST['descripcion'] ?? '';
    $observaciones = $_POST['observaciones'] ?? '';
    $tratamiento_prescrito = $_POST['tratamiento_prescrito'] ?? '';
    $tipo = $_POST['tipo'] ?? 'consulta';

    if (!$cita_id) {
        echo json_encode(["success" => false, "error" => "Falta seleccionar una cita"]);
        exit;
    }

    // Obtener paciente desde la cita
    $stmt = $conn->prepare("SELECT paciente_id FROM cita WHERE id_cita = ?");
    $stmt->execute([$cita_id]);
    $cita = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$cita) {
        echo json_encode(["success" => false, "error" => "Cita no encontrada"]);
        exit;
    }
    $paciente_id = $cita['paciente_id'];

    // Verificar si existe historial medico para este paciente
    $stmt = $conn->prepare("SELECT id_historial FROM historial_medico WHERE paciente_id = ?");
    $stmt->execute([$paciente_id]);
    $historial = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($historial) {
        $historial_id = $historial['id_historial'];
    } else {
        // Crear historial medico
        $stmt = $conn->prepare("INSERT INTO historial_medico (paciente_id, created_at, updated_at) VALUES (?, NOW(), NOW())");
        $stmt->execute([$paciente_id]);
        $historial_id = $conn->lastInsertId();
    }

    // Insertar registro clínico
    $stmt = $conn->prepare("INSERT INTO registro_clinico 
        (historial_id, cita_id, fecha, tipo, descripcion, observaciones, tratamiento_prescrito)
        VALUES (?, ?, NOW(), ?, ?, ?, ?)");
    $stmt->execute([$historial_id, $cita_id, $tipo, $descripcion, $observaciones, $tratamiento_prescrito]);
    $registro_id = $conn->lastInsertId();

    // Manejar imágenes subidas
    if (!empty($_FILES['imagenes']['name'][0])) {
        $uploadDir = $_SERVER['DOCUMENT_ROOT'] . "/uploads/historial/";
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

        foreach ($_FILES['imagenes']['tmp_name'] as $key => $tmpName) {
            $filename = time() . "_" . basename($_FILES['imagenes']['name'][$key]);
            $targetFile = $uploadDir . $filename;

            if (move_uploaded_file($tmpName, $targetFile)) {
                $stmt = $conn->prepare("INSERT INTO imagen (ruta_archivo, tipo_archivo, fecha_subida, estudio_id, visible_para_pacientes) VALUES (?, ?, NOW(), NULL, 0)");
                $stmt->execute([
                    "/uploads/historial/" . $filename,
                    $_FILES['imagenes']['type'][$key]
                ]);
            }
        }
    }

    echo json_encode(["success" => true, "message" => "Historial agregado correctamente"]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
