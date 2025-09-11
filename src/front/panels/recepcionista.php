<?php
session_start();
require $_SERVER['DOCUMENT_ROOT'].'/back/db/connection.php';

// Protección por rol
if (!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'recepcionista') {
    header("Location: /front/pages/login.html");
    exit;
}

$recepcionista_id = $_SESSION['id_persona'];

// Obtener datos del recepcionista
$stmt = $conn->prepare("SELECT nombre, apellido, email, telefono, foto FROM persona WHERE id_persona=?");
$stmt->execute([$recepcionista_id]);
$recepcionista = $stmt->fetch(PDO::FETCH_ASSOC);

// Ruta de foto absoluta
$fotoRecepcionista = $recepcionista['foto'] ? '/'.$recepcionista['foto'] : "/front/assets/updates/recepcionista/{$recepcionista_id}.png";
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Panel Recepcionista</title>
    <link rel="icon" href="/front/assets/images/logo.ico" sizes="32x32"/>
    <link rel="stylesheet" href="/front/assets/styles_panels/recepcion.css">
    <script src="/front/scripts_panels/recepcion.js" defer></script>
</head>
<body>
<div class="container-panel">
    <!-- Sidebar -->
    <aside class="sidebar">
        <div class="user-info">
            <div class="user-photo">
                <img src="<?= htmlspecialchars($fotoRecepcionista) ?>" 
                    alt="Foto"
                    onerror="this.onerror=null;this.src='/front/assets/images/default_user.png';">
            </div>
            <h3><?= htmlspecialchars($recepcionista['nombre'] . ' ' . $recepcionista['apellido']); ?></h3>
            <p>Recepcionista</p>
        </div>
        <nav class="sidebar-nav">
            <button id="btn-pacientes">Pacientes</button>
            <button id="btn-add-paciente">Agregar Paciente</button>
            <button id="btn-citas">Citas</button>
            <button id="btn-facturacion">Facturación</button>
            <button id="btn-mensajes">Mensajes</button>
            <button id="btn-edit-profile">Editar Perfil</button>
            <a href="/front/panels/logout.php" class="logout">Cerrar Sesión</a>
        </nav>
    </aside>

    <!-- Main -->
    <main class="main-content">
        <!-- Pacientes -->
        <section id="section-pacientes" class="section active">
            <h2>Pacientes</h2>
            <div id="pacientesList" class="cards-container"></div>
        </section>

        <!-- Agregar paciente -->
        <section id="section-add-paciente" class="section">
            <h2>Agregar Paciente</h2>
            <form id="addPacienteForm" class="form-card">
                <input type="text" name="nombre" placeholder="Nombre" required>
                <input type="text" name="apellido" placeholder="Apellido" required>
                <input type="email" name="email" placeholder="Correo" required>
                <input type="password" name="password" placeholder="Contraseña por defecto" required>
                <button type="submit" class="btn">Agregar Paciente</button>
            </form>
        </section>

        <!-- Citas -->
        <section id="section-citas" class="section">
            <h2>Agregar Cita</h2>
            <form id="addCitaForm" class="form-card">
                <select name="paciente_id" required></select>
                <select name="sucursal_id" required></select>
                <select name="funcionario_id" required></select>
                <input type="datetime-local" name="fecha_hora_inicio" required>
                <input type="datetime-local" name="fecha_hora_fin" required>
                <button type="submit" class="btn">Agregar Cita</button>
            </form>
        </section>

        <!-- Facturación -->
        <section id="section-facturacion" class="section">
            <h2>Facturación</h2>
            <div id="facturasList" class="cards-container"></div>

            <h3>Agregar Factura</h3>
            <form id="addFacturaForm" class="form-card">
                <select name="paciente_id" required></select>
                <input type="number" name="monto_total" placeholder="Monto total" step="0.01" required>
                <select name="estado">
                    <option value="pendiente">Pendiente</option>
                    <option value="pagada">Pagada</option>
                    <option value="anulada">Anulada</option>
                </select>
                <button type="submit" class="btn">Agregar Factura</button>
            </form>
        </section>

        <!-- Mensajes -->
        <section id="section-mensajes" class="section">
            <h2>Mensajes</h2>
            <div class="messages-card">
                <h3>Recordatorio de citas</h3>
                <textarea id="mensajeCita" placeholder="Mensaje predeterminado para citas"></textarea>
                <button id="sendAllCitas">Enviar a todos</button>
            </div>
            <div class="messages-card">
                <h3>Felicidades de cumpleaños</h3>
                <textarea id="mensajeCumple" placeholder="Mensaje predeterminado de cumpleaños"></textarea>
                <button id="sendAllCumple">Enviar a todos</button>
            </div>
        </section>

        <!-- Editar perfil -->
        <section id="section-edit-profile" class="section">
            <h2>Editar Perfil</h2>
            <form id="editProfileForm" class="form-card" enctype="multipart/form-data">
                <input type="text" name="nombre" value="<?= htmlspecialchars($recepcionista['nombre']); ?>" placeholder="Nombre" required>
                <input type="text" name="apellido" value="<?= htmlspecialchars($recepcionista['apellido']); ?>" placeholder="Apellido" required>
                <input type="email" name="email" value="<?= htmlspecialchars($recepcionista['email']); ?>" placeholder="Correo" required>
                <input type="text" name="telefono" value="<?= htmlspecialchars($recepcionista['telefono']); ?>" placeholder="Teléfono">
                <label>Foto de perfil:</label>
                <input type="file" name="foto" accept="image/*" id="fotoInput">
                <img id="previewFoto" src="<?= htmlspecialchars($fotoRecepcionista) ?>" 
                    alt="Previsualización" 
                    onerror="this.onerror=null;this.src='/front/assets/images/default_user.png';"
                    style="width:100px;height:100px;object-fit:cover;margin-top:10px;border-radius:50%;border:1px solid #ccc;">
                <button type="submit" class="btn">Guardar Cambios</button>
            </form>
        </section>
    </main>
</div>
</body>
</html>
