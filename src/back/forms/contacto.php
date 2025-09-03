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
$nombre  = trim(htmlspecialchars($_POST['nombre']));
$correo  = trim(htmlspecialchars($_POST['correo']));
$asunto  = trim(htmlspecialchars($_POST['asunto']));
$mensaje = trim(htmlspecialchars($_POST['mensaje']));

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
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
    $mail->Username   = 'pereiraluciano28101976@gmail.com'; // tu correo real
    $mail->Password   = 'obxj lriu edsq vbtl';               // contraseña de aplicación Gmail
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    // Remitente y destinatario
    $mail->setFrom('pereiraluciano28101976@gmail.com', 'Formulario de contacto'); // remitente real
    $mail->addReplyTo($correo, $nombre);   // usuario que llenó el formulario
    $mail->addAddress('pereiraluciano28101976@gmail.com', 'Administrador'); // tu correo destino

    // Contenido del correo
    $mail->isHTML(true);
    $mail->Subject = $asunto;
    $mail->Body    = "<h3>Nuevo mensaje de contacto</h3>
                        <p><b>Nombre:</b> $nombre</p>
                        <p><b>Correo:</b> $correo</p>
                        <p><b>Asunto:</b> $asunto</p>
                        <p><b>Mensaje:</b><br>$mensaje</p>";

    $mail->send();
    header("Location: /front/pages/gracias.html");
    exit();

} catch (Exception $e) {
    echo "Error al enviar el mensaje: {$mail->ErrorInfo}";
}
