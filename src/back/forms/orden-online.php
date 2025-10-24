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
    die("<p style='color:red;'>Error: Por favor completá el reCAPTCHA.</p>");
}

$response = $_POST['g-recaptcha-response'];
$remoteip = $_SERVER['REMOTE_ADDR'];

$recaptcha_url = 'https://www.google.com/recaptcha/api/siteverify';
$recaptcha = file_get_contents($recaptcha_url . '?secret=' . $secretKey . '&response=' . $response . '&remoteip=' . $remoteip);
$recaptcha = json_decode($recaptcha);

if (!$recaptcha->success) {
    die("<p style='color:red;'>Error: reCAPTCHA inválido.</p>");
}

// ----------------------
// 2️⃣ Datos del formulario (limpieza y validación)
// ----------------------

// Paciente
$paciente  = trim(htmlspecialchars($_POST['paciente']));
$celular_paciente  = trim(htmlspecialchars($_POST['celular-paciente']));
$ci  = trim(htmlspecialchars($_POST['ci']));

// Profesional solicitante
$nombre_doctor = trim(htmlspecialchars($_POST['nombre-doctor']));
$contacto_doctor = trim(htmlspecialchars($_POST['contacto-doctor']));
$aclaracion = trim(htmlspecialchars($_POST['aclaracion']));
$asunto = "Nueva orden online"; // O usa $_POST['asunto'] si lo agregas al formulario

// ----------------------
// Validación de email: solo Gmail o Hotmail
// ----------------------
$emailRegex = "/^[^\s@]+@(gmail\.com|hotmail\.com)$/i";
if (!preg_match($emailRegex, $contacto_doctor)) {
    echo "<p style='color:red;'>Ingrese un email correcto (solo @gmail.com o @hotmail.com)</p>";
    // No detenemos el script, solo mostramos el error y no enviamos el correo
    exit();
}

// ----------------------
// 3️⃣ Configuración de PHPMailer
// ----------------------
$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'ariel.gonzalez.caraballo@gmail.com';
    $mail->Password   = 'erye bvxn yjkz zzsa';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    $mail->setFrom('ariel.gonzalez.caraballo@gmail.com', 'Formulario de contacto');
    $mail->addReplyTo($contacto_doctor, $nombre_doctor);
    $mail->addAddress('ariel.gonzalez.caraballo@gmail.com', 'Administrador');

    $mail->isHTML(true);
    $mail->Subject = $asunto;
    $mail->Body    = "<h3>Nueva solicitud de delegación de paciente</h3>
                        <p><b>Nombre del doctor:</b> $nombre_doctor</p>
                        <p><b>Correo del doctor:</b> $contacto_doctor</p>
                        <p><b>Aclaración:</b> $aclaracion</p>
                        <p><b>Paciente:</b> $paciente</p>
                        <p><b>Teléfono del paciente:</b> $celular_paciente</p>
                        <p><b>Cédula del paciente:</b> $ci</p>";

    $mail->send();
    header("Location: /front/pages/gracias.html");
    exit();

} catch (Exception $e) {
    echo "<p style='color:red;'>Error al enviar el mensaje: {$mail->ErrorInfo}</p>";
}
