<?php
header('Content-Type: application/json; charset=utf-8');
require '../db/connection.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/../../vendor/autoload.php';

// ----------------------
// 1️⃣ Recibir email desde POST normal
// ----------------------
$email = trim($_POST['email'] ?? '');

if (!$email) {
    echo json_encode(["success" => false, "error" => "Ingrese su correo"]);
    exit;
}

// ----------------------
// 2️⃣ Validación de formato
// ----------------------
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "error" => "Ingrese un email válido"]);
    exit;
}

// Validar dominios permitidos
$dominiosPermitidos = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com'];
$dominio = substr(strrchr($email, "@"), 1);
if (!in_array(strtolower($dominio), $dominiosPermitidos)) {
    echo json_encode(["success" => false, "error" => "Solo se permiten Gmail, Hotmail, Outlook o Yahoo"]);
    exit;
}

// ----------------------
// 3️⃣ Verificar que el email exista en la base
// ----------------------
$stmt = $conn->prepare("SELECT persona_id FROM acceso WHERE correo = ?");
$stmt->execute([$email]);
if ($stmt->rowCount() === 0) {
    echo json_encode(["success" => false, "error" => "El correo no está registrado"]);
    exit;
}

$persona_id = $stmt->fetch(PDO::FETCH_ASSOC)['persona_id'];

// ----------------------
// 4️⃣ Generar token seguro y expiración (1 hora)
// ----------------------
$token = bin2hex(random_bytes(32));
$expira = date("Y-m-d H:i:s", strtotime('+1 hour'));

// ----------------------
// 5️⃣ Guardar token en la base
// ----------------------
// Asegurate de tener la tabla password_resets:
// CREATE TABLE password_resets (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   persona_id INT NOT NULL,
//   token VARCHAR(64) NOT NULL,
//   expiracion DATETIME NOT NULL
// );
$stmt = $conn->prepare("INSERT INTO password_resets (persona_id, token, expiracion) VALUES (?, ?, ?)");
$stmt->execute([$persona_id, $token, $expira]);

// ----------------------
// 6️⃣ Construir resetLink robusto
// ----------------------
$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost:8080';
$docroot = rtrim($_SERVER['DOCUMENT_ROOT'], '/');

$candidates = [
    '/front/pages/reset-password.html',
    '/src/front/pages/reset-password.html',
    '/reset-password.html',
    '/pages/reset-password.html'
];

$pathFound = null;
foreach ($candidates as $c) {
    if (file_exists($docroot . $c)) {
        $pathFound = $c;
        break;
    }
}
// si no encontramos ninguno, usar la primera como fallback
if (!$pathFound) $pathFound = $candidates[0];

$resetLink = $scheme . '://' . $host . $pathFound . '?token=' . urlencode($token);

// ----------------------
// 7️⃣ Enviar correo con link de reseteo
// ----------------------
try {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'ariel.gonzalez.caraballo@gmail.com';
    $mail->Password   = 'erye bvxn yjkz zzsa'; // mueve esto a una variable de entorno
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    $mail->setFrom('ariel.gonzalez.caraballo@gmail.com', 'Clínica Imagen');
    $mail->addAddress($email);
    $mail->isHTML(true);
    $mail->Subject = "Restablecer contraseña";

    $mail->Body = "
        <h3>Solicitud de restablecimiento de contraseña</h3>
        <p>Haz clic en el siguiente enlace para cambiar tu contraseña (válido 1 hora):</p>
        <a href='$resetLink'>$resetLink</a>
        <p>Si no solicitaste este cambio, ignora este correo.</p>
    ";

    $mail->send();
    echo json_encode(["success" => true, "message" => "Se ha enviado un correo con instrucciones para restablecer tu contraseña."]);
    exit;

} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => "No se pudo enviar el correo: {$mail->ErrorInfo}"]);
}
