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

// Foto admin
$fotoAdmin = $admin['foto'] ? '/'.$admin['foto'] : "/front/assets/images/default_user.png";
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel Admin</title>
    <link rel="stylesheet" href="../../front/assets/styles_panels/admin.css">
    <script src="../../front/scripts_panels/admin.js" defer></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
<div class="admin-container">

    <!-- SIDEBAR -->
    <aside class="sidebar">
        <div class="admin-info">
            <div class="admin-photo">
                <img id="sidebarFotoAdmin" src="<?= htmlspecialchars($fotoAdmin) ?>" 
                    alt="Foto Admin"
                    onerror="this.onerror=null;this.src='../assets/images/default_user.png';">
            </div>
            <h3><?= htmlspecialchars($admin['nombre'].' '.$admin['apellido']); ?></h3>
            <p>Administrador</p>
        </div>
        <nav class="sidebar-nav">
            <button id="btn-users"><i class="fas fa-users"></i> Usuarios</button>
            <button id="btn-add-user"><i class="fas fa-user-plus"></i> Agregar Usuario</button>
            <button id="btn-edit-profile"><i class="fas fa-user-edit"></i> Editar Perfil</button>
            <button id="btn-add-funcionario"><i class="fas fa-user-md"></i> Agregar Funcionario</button>
            <button id="btn-list-funcionarios"><i class="fas fa-briefcase"></i> Listar Funcionarios</button>
            <button id="btn-add-sucursal"><i class="fas fa-building"></i> Agregar Sucursal</button>
            <button id="btn-list-sucursales"><i class="fas fa-list"></i> Listar Sucursales</button>
            <a href="logout.php" class="logout"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</a>
        </nav>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="main-content">

        <!-- SECCIÓN USUARIOS -->
        <section id="section-users" class="section active">
            <h2>Usuarios</h2>
            <div id="usersList" class="cards-container">
                <p>Cargando usuarios...</p>
            </div>
        </section>

        <!-- SECCIÓN AGREGAR USUARIO -->
        <section id="section-add-user" class="section">
            <h2>Agregar Usuario</h2>
            <form id="addUserForm" class="form-card" enctype="multipart/form-data">
                <input type="text" name="nombre" placeholder="Nombre" required>
                <input type="text" name="apellido" placeholder="Apellido" required>
                <input type="email" name="email" placeholder="Correo" required>
                <input type="password" name="password" placeholder="Contraseña" required>
                <select name="rol" required>
                    <option value="">Seleccionar rol</option>
                    <option value="paciente">Paciente</option>
                    <option value="recepcionista">Recepcionista</option>
                </select>

                <label>Foto de perfil</label>
                <input type="file" id="fotoInputAdd" name="foto">
                <div class="admin-photo-edit">
                    <img id="fotoPreviewAdd" src="/front/assets/images/default_user.png" alt="Preview">
                </div>

                <button type="submit" class="btn">Agregar Usuario</button>
            </form>
        </section>

        <!-- SECCIÓN EDITAR PERFIL -->
        <section id="section-edit-profile" class="section">
            <h2>Editar Perfil</h2>
            <form id="editProfileForm" class="form-card" enctype="multipart/form-data">
                <input type="text" name="nombre" placeholder="Nombre">
                <input type="text" name="apellido" placeholder="Apellido">
                <input type="email" name="correo" placeholder="Correo">
                <label>Foto de perfil</label>
                <input type="file" id="fotoInputEdit" name="foto">
                <div class="admin-photo-edit">
                    <img id="fotoPreviewEdit" src="/front/assets/images/default_user.png" alt="Preview">
                </div>
                <button type="submit" class="btn">Guardar Cambios</button>
            </form>
        </section>

        <!-- SECCIÓN AGREGAR FUNCIONARIO -->
        <section id="section-add-funcionario" class="section">
            <h2>Agregar Funcionario</h2>
            <form id="addFuncionarioForm" class="form-card" enctype="multipart/form-data">
                <input type="text" name="nombre" placeholder="Nombre" required>
                <input type="text" name="apellido" placeholder="Apellido" required>
                <input type="email" name="correo" placeholder="Correo" required>
                <input type="password" name="password" placeholder="Contraseña" required>
                <select name="tipo_funcionario" required>
                    <option value="">Seleccionar Tipo</option>
                    <option value="medico">Médico</option>
                    <option value="tecnico">Técnico</option>
                    <option value="administrativo">Administrativo</option>
                </select>
                <select name="sucursal_id" id="sucursalSelectFuncionario" required>
                    <option value="">Seleccionar Sucursal</option>
                    <!-- Opciones cargadas dinámicamente por JS -->
                </select>
                <input type="text" name="matricula" placeholder="Matrícula profesional">
                <label>Foto de perfil</label>
                <input type="file" name="foto" id="fotoInputFuncionario">
                <div class="admin-photo-edit">
                    <img id="fotoPreviewFuncionario" src="/front/assets/images/default_user.png" alt="Preview">
                </div>
                <button type="submit" class="btn">Agregar Funcionario</button>
            </form>
        </section>

        <!-- SECCIÓN LISTAR FUNCIONARIOS -->
        <section id="section-list-funcionarios" class="section">
            <h2>Funcionarios</h2>
            <div id="funcionariosList" class="cards-container">
                <p>Cargando funcionarios...</p>
            </div>
        </section>

        <!-- SECCIÓN AGREGAR SUCURSAL -->
        <section id="section-add-sucursal" class="section">
            <h2>Agregar Sucursal</h2>
            <form id="addSucursalForm" class="form-card">
                <input type="text" name="nombre" placeholder="Nombre Sucursal" required>
                <input type="text" name="direccion" placeholder="Dirección" required>
                <input type="text" name="telefono" placeholder="Teléfono">
                <label>Horario Apertura</label>
                <input type="time" name="horario_apertura" required>
                <label>Horario Cierre</label>
                <input type="time" name="horario_cierre" required>
                <button type="submit" class="btn">Agregar Sucursal</button>
            </form>
        </section>

        <!-- SECCIÓN LISTAR SUCURSALES -->
        <section id="section-list-sucursales" class="section">
            <h2>Sucursales</h2>
            <div id="sucursalesList" class="cards-container">
                <p>Cargando sucursales...</p>
            </div>
        </section>

    </main>
</div>

</body>
</html>
