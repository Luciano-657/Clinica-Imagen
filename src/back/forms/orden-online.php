<?php
// Importar PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/../../vendor/autoload.php';

// ----------------------
// 1️⃣ reCAPTCHA
// ----------------------
$secretKey = "6Ld3634rAAAAAB2qQWg8GTeqDaVSWDeCMwYATMJc";

if (!isset($_POST['g-recaptcha-response'])) {
    die("Error: Por favor completá el reCAPTCHA.");
}

$response = $_POST['g-recaptcha-response'];
$remoteip = $_SERVER['REMOTE_ADDR'];

$recaptcha_url = 'https://www.google.com/recaptcha/api/siteverify';
$recaptcha = file_get_contents($recaptcha_url . '?secret=' . $secretKey . '&response=' . $response . '&remoteip=' . $remoteip);
$recaptcha = json_decode($recaptcha);

if (!$recaptcha->success) {
    die("Error: reCAPTCHA inválido.");
}

// ----------------------
// 2️⃣ Datos del formulario (limpieza y validación)
// ----------------------

//Paciente
$paciente  = trim(htmlspecialchars($_POST['paciente']));
$celular_paciente  = trim(htmlspecialchars($_POST['celular-paciente']));
$ci  = trim(htmlspecialchars($_POST['ci']));

//Profesional solicitante
$nombre_doctor = trim(htmlspecialchars($_POST['nombre-doctor']));
$contacto_doctor = trim(htmlspecialchars($_POST['contacto-doctor']));
$aclaracion = trim(htmlspecialchars($_POST['aclaracion']));
$asunto = "Nueva orden online"; // O usa $_POST['asunto'] si lo agregas al formulario
$radiografía_intrabucal_seccion = isset($_POST['radio-intra[]']);


if (!filter_var($contacto_doctor, FILTER_VALIDATE_EMAIL)) {
    die("Error: Correo electrónico inválido.");
}

// ----------------------
// 3️⃣ Configuración de PHPMailer
// ----------------------
$mail = new PHPMailer(true);

try {
    // Servidor SMTP de Gmail
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'ariel.gonzalez.caraballo@gmail.com'; // tu correo real
    $mail->Password   = 'erye bvxn yjkz zzsa';               // contraseña de aplicación Gmail
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    // Remitente y destinatario
    $mail->setFrom('ariel.gonzalez.caraballo@gmail.com', 'Formulario de contacto'); // remitente real
    $mail->addReplyTo($contacto_doctor, $nombre_doctor); // usuario que llenó el formulario
    $mail->addAddress('ariel.gonzalez.caraballo@gmail.com', 'Administrador'); // tu correo destino

    // Contenido del correo
    $mail->isHTML(true);
    $mail->Subject = $asunto;
    $mail->Body    = "<h3>Nueva solicitud de delegación de paciente</h3>
                        <p><b>Nombre del doctor:</b> $nombre_doctor</p>
                        <p><b>Correo del doctor:</b> $contacto_doctor</p>
                        <p><b>Aclaración:</b> $aclaracion</p>
                        <p><b>Paciente:</b> $paciente</p>
                        <p><b>Teléfono del paciente:</b> $celular_paciente</p>
                        <p><b>Cédula del paciente:</b> $ci</p>
                        
                        ";
                    

    $mail->send();
    header("Location: /front/pages/gracias.html");
    exit();

} catch (Exception $e) {
    echo "Error al enviar el mensaje: {$mail->ErrorInfo}";
}