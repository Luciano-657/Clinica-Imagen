<?php
session_start();
require '../../back/db/connection.php';

if(!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'paciente'){
    header("Location: ../pages/login.html");
    exit;
}

$persona_id = $_SESSION['id_persona'];

$stmt = $conn->prepare("SELECT * FROM persona WHERE id_persona=?");
$stmt->execute([$persona_id]);
$paciente = $stmt->fetch(PDO::FETCH_ASSOC);

// Si no tiene foto, usar avatar por defecto
$fotoPaciente = $paciente['foto'] ?: "front/assets/images/avatar.jpg";
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Panel Paciente</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="/front/assets/images/logo.ico" sizes="32x32"/>
    <link rel="stylesheet" href="../assets/styles_panels/paciente.css">
    <script src="../scripts_panels/paciente.js" defer></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
<div class="paciente-container">

    <!-- Sidebar -->
    <aside class="sidebar">
        <div class="user-photo">
            <img id="previewFotoSidebar"
                src="/<?= htmlspecialchars($fotoPaciente) ?>"
                alt="Foto de perfil"
                onerror="this.onerror=null;this.src='/front/assets/images/avatar.jpg';">
        </div>
        <nav class="sidebar-nav">
            <button id="btn-perfil"><i class="fas fa-user"></i> Perfil</button>
            <button id="btn-citas"><i class="fas fa-calendar-check"></i> Citas</button>
            <button id="btn-facturas"><i class="fas fa-file-invoice-dollar"></i> Facturas</button>
            <button id="btn-historial"><i class="fas fa-notes-medical"></i> Historial Médico</button>
            <a href="logout.php" class="logout"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</a>
        </nav>
    </aside>

    <!-- Main -->
    <main class="main-content">

        <!-- Perfil -->
        <section id="section-perfil" class="section active">
            <h2>Perfil</h2>
            <form id="editProfileForm" class="form-card" enctype="multipart/form-data">
                <div class="admin-photo-edit">
                    <img id="previewFoto"
                        src="/<?= htmlspecialchars($fotoPaciente) ?>"
                        alt="Previsualización"
                        onerror="this.onerror=null;this.src='/front/assets/images/avatar.jpg';">
                </div>
                <input type="text" name="nombre" placeholder="Nombre" required value="<?= htmlspecialchars($paciente['nombre'] ?? '') ?>">
                <input type="text" name="apellido" placeholder="Apellido" required value="<?= htmlspecialchars($paciente['apellido'] ?? '') ?>">
                <input type="email" name="email" placeholder="Correo" required value="<?= htmlspecialchars($paciente['email'] ?? '') ?>">
                <input type="text" name="cedula" placeholder="Cédula" required value="<?= htmlspecialchars($paciente['cedula'] ?? '') ?>">
                <input type="date" name="fecha_nacimiento" placeholder="Fecha de Nacimiento" required value="<?= htmlspecialchars($paciente['fecha_nacimiento'] ?? '') ?>">
                <input type="text" name="direccion" placeholder="Dirección" required value="<?= htmlspecialchars($paciente['direccion'] ?? '') ?>">
                <input type="text" name="telefono" placeholder="Teléfono" required value="<?= htmlspecialchars($paciente['telefono'] ?? '') ?>">
                <label>Foto de perfil:</label>
                <input type="file" name="foto" accept="image/*" id="fotoInput">
                <button type="submit" class="btn">Guardar Cambios</button>
            </form>
        </section>

        <!-- Citas -->
        <section id="section-citas" class="section">
            <h2>Citas</h2>
            <div id="citasList" class="cards-container"></div>
        </section>

        <!-- Facturas -->
        <section id="section-facturas" class="section">
            <h2>Facturas</h2>
            <div id="facturasList" class="cards-container"></div>
        </section>

        <!-- Historial Medico-->
        <section id="section-historial" class="section">
            <h2>Historial Médico</h2>

            <!-- Historiales aprobados -->
            <h3>Historiales Médicos</h3>
            <div id="historialList" class="cards-container">
                <p>Cargando historiales...</p>
            </div>

            <!-- Solicitudes de historial -->
            <h3>Solicitudes de Historial Médico</h3>
            <div id="historialRequestsList" class="cards-container">
                <p>Cargando solicitudes...</p>
            </div>

            <!-- Formulario para enviar solicitud -->
            <form id="requestHistorialForm" class="form-card">
                <label>Motivo de la solicitud</label>
                <textarea name="motivo" rows="4" required placeholder="Explica brevemente por qué solicitas tu historial médico"></textarea>
                <button type="submit" class="btn">Enviar Solicitud</button>
            </form>
        </section>
    </main>
</div>

<div class="toast-container"></div>
</body>
</html>
