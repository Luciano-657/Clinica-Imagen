<?php
session_start();
require $_SERVER['DOCUMENT_ROOT'].'/back/db/connection.php';

// Protección por rol
if (!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'admin') {
    header("Location: /front/pages/login.html");
    exit;
}

$admin_id = $_SESSION['id_persona'];

// Obtener datos del admin
$stmt = $conn->prepare("SELECT nombre, apellido, email, telefono, foto FROM persona WHERE id_persona=?");
$stmt->execute([$admin_id]);
$admin = $stmt->fetch(PDO::FETCH_ASSOC);

// Ruta de foto absoluta
$fotoAdmin = $admin['foto'] ? '/'.$admin['foto'] : "/front/assets/updates/admin/{$admin_id}.png";
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Panel Administrador</title>
    <link rel="icon" href="/front/assets/images/logo.ico" sizes="32x32"/>
    <link rel="stylesheet" href="/front/assets/styles_panels/admin.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <script src="/front/scripts_panels/admin.js" defer></script>
</head>
<body>
<div class="admin-container">
    <!-- Sidebar -->
    <aside class="sidebar">
        <div class="admin-info">
            <div class="admin-photo">
                <img src="<?= htmlspecialchars($fotoAdmin) ?>" 
                    alt="Foto Admin"
                    onerror="this.onerror=null;this.src='/front/assets/images/default_user.png';">
            </div>
            <h3><?= htmlspecialchars($admin['nombre'] . ' ' . $admin['apellido']); ?></h3>
            <p>Administrador</p>
        </div>
        <nav class="sidebar-nav">
            <button id="btn-users"><i class="fas fa-users"></i> Usuarios</button>
            <button id="btn-add-user"><i class="fas fa-user-plus"></i> Añadir Usuario</button>
            <button id="btn-edit-profile"><i class="fas fa-user-cog"></i> Editar Perfil</button>
            <a href="/front/panels/logout.php" class="logout"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</a>
        </nav>
    </aside>

    <!-- Main -->
    <main class="main-content">
        <!-- Usuarios -->
        <section id="section-users" class="section active">
            <h2>Usuarios Registrados</h2>
            <div id="usersList" class="cards-container"></div>
        </section>

        <!-- Añadir usuario -->
        <section id="section-add-user" class="section">
            <h2>Añadir Nuevo Usuario</h2>
            <form id="addUserForm" class="form-card">
                <input type="text" name="nombre" placeholder="Nombre" required>
                <input type="text" name="apellido" placeholder="Apellido" required>
                <input type="email" name="email" placeholder="Correo" required>
                <input type="password" name="password" placeholder="Contraseña por defecto" required>
                <select name="rol" required>
                    <option value="">Seleccionar rol</option>
                    <option value="paciente">Paciente</option>
                    <option value="recepcionista">Recepcionista</option>
                </select>
                <button type="submit" class="btn">Añadir Usuario</button>
            </form>
        </section>

        <!-- Editar perfil -->
        <section id="section-edit-profile" class="section">
            <h2>Editar Perfil</h2>
            <form id="editProfileForm" class="form-card" enctype="multipart/form-data">
                <input type="text" name="nombre" value="<?= htmlspecialchars($admin['nombre']); ?>" placeholder="Nombre" required>
                <input type="text" name="apellido" value="<?= htmlspecialchars($admin['apellido']); ?>" placeholder="Apellido" required>
                <input type="email" name="email" value="<?= htmlspecialchars($admin['email']); ?>" placeholder="Correo" required>
                <input type="text" name="telefono" value="<?= htmlspecialchars($admin['telefono']); ?>" placeholder="Teléfono">
                <label>Foto de perfil:</label>
                <input type="file" name="foto" accept="image/*" id="fotoInput">
                <img id="fotoPreview" src="<?= htmlspecialchars($fotoAdmin) ?>" 
                    alt="Previsualización" 
                    onerror="this.onerror=null;this.src='/front/assets/images/default_user.png';"
                    style="width:100px; height:100px; object-fit:cover; border-radius:50%; margin-top:10px; border:1px solid #ccc;">
                <button type="submit" class="btn">Guardar Cambios</button>
            </form>
        </section>
    </main>
</div>

<!-- Contenedor de mensajes flotantes -->
<div class="toast-container"></div>
</body>
</html>
