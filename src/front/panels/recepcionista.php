<?php
session_start();
require $_SERVER['DOCUMENT_ROOT'] . '/back/db/connection.php';

// Protección por rol
if (!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'recepcionista') {
    header("Location: /front/pages/login.html");
    exit;
}

$recepcionista_id = $_SESSION['id_persona'];

// Datos del recepcionista
$stmt = $conn->prepare("
    SELECT nombre, apellido, email, telefono, foto 
    FROM persona 
    WHERE id_persona = ?
");
$stmt->execute([$recepcionista_id]);
$recepcionista = $stmt->fetch(PDO::FETCH_ASSOC);

// Foto
$fotoRecepcionista = $recepcionista['foto'] 
    ? '/' . $recepcionista['foto'] 
    : "/front/assets/updates/recepcionista/{$recepcionista_id}.png";

// Pacientes para selects (usar id_paciente)
$pacientes = $conn->query("
    SELECT pa.id_paciente, p.nombre, p.apellido
    FROM paciente pa
    INNER JOIN persona p ON pa.persona_id = p.id_persona
")->fetchAll(PDO::FETCH_ASSOC);

// Funcionarios para selects (usar id_funcionario)
$funcionarios = $conn->query("
    SELECT f.id_funcionario, p.nombre, p.apellido
    FROM funcionario f
    INNER JOIN persona p ON f.persona_id = p.id_persona
")->fetchAll(PDO::FETCH_ASSOC);

// Sucursales
$sucursales = $conn->query("SELECT id_sucursal, nombre FROM sucursal")->fetchAll(PDO::FETCH_ASSOC);

// Registros clínicos (para mostrar listado básico en la sección historial)
$registros = $conn->query("
    SELECT rc.id_registro, rc.fecha, rc.tipo, rc.descripcion, rc.observaciones, rc.tratamiento_prescrito,
        p.nombre AS paciente_nombre, p.apellido AS paciente_apellido,
        fp.nombre AS funcionario_nombre, fp.apellido AS funcionario_apellido
    FROM registro_clinico rc
    JOIN historial_medico h ON rc.historial_id = h.id_historial
    JOIN paciente pa ON h.paciente_id = pa.id_paciente
    JOIN persona p ON pa.persona_id = p.id_persona
    LEFT JOIN cita c ON rc.cita_id = c.id_cita
    LEFT JOIN funcionario f ON c.funcionario_id = f.id_funcionario
    LEFT JOIN persona fp ON f.persona_id = fp.id_persona
    ORDER BY rc.fecha DESC
    LIMIT 50
")->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Panel Recepcionista</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="/front/assets/images/logo.ico" sizes="32x32">
    <link rel="stylesheet" href="../assets/styles_panels/recepcion.css">
    <script src="../scripts_panels/recepcion.js" defer></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body>
<div class="container-panel">

    <!-- Sidebar -->
    <aside class="sidebar" id="sidebarMenu">
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
            <button id="btn-pacientes"><i class="fas fa-users"></i> <span>Pacientes</span></button>
            <button id="btn-add-paciente"><i class="fas fa-user-plus"></i> <span>Agregar Paciente</span></button>
            <button id="btn-citas"><i class="fas fa-calendar-check"></i> <span>Citas</span></button>
            <button id="btn-historial"><i class="fas fa-notes-medical"></i> <span>Historial Médico</span></button>
            <button id="btn-facturacion"><i class="fas fa-file-invoice-dollar"></i> <span>Facturación</span></button>
            <button id="btn-mensajes"><i class="fas fa-envelope"></i> <span>Mensajes</span></button>
            <button id="btn-edit-profile"><i class="fas fa-user-edit"></i> <span>Editar Perfil</span></button>
            <a href="logout.php" class="logout"><i class="fas fa-sign-out-alt"></i> <span>Cerrar Sesión</span></a>
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
            <h2>Citas Programadas</h2>
            <div id="citasList" class="cards-container"></div>

            <h2>Agregar Cita</h2>
            <form id="addCitaForm" class="form-card">
                <select name="id_paciente" required>
                    <option value="">Seleccione paciente</option>
                    <?php foreach($pacientes as $p): ?>
                        <option value="<?= htmlspecialchars($p['id_paciente']) ?>">
                            <?= htmlspecialchars($p['nombre'] . ' ' . $p['apellido']) ?>
                        </option>
                    <?php endforeach; ?>
                </select>

                <select name="id_sucursal" required>
                    <option value="">Seleccione sucursal</option>
                    <?php foreach($sucursales as $s): ?>
                        <option value="<?= htmlspecialchars($s['id_sucursal']) ?>">
                            <?= htmlspecialchars($s['nombre']) ?>
                        </option>
                    <?php endforeach; ?>
                </select>

                <select name="id_funcionario" required>
                    <option value="">Seleccione funcionario</option>
                    <?php foreach($funcionarios as $f): ?>
                        <option value="<?= htmlspecialchars($f['id_funcionario']) ?>">
                            <?= htmlspecialchars($f['nombre'] . ' ' . $f['apellido']) ?>
                        </option>
                    <?php endforeach; ?>
                </select>

                <input type="datetime-local" name="fecha_hora_inicio" required>
                <input type="datetime-local" name="fecha_hora_fin" required>
                <button type="submit" class="btn">Agregar Cita</button>
            </form>
        </section>

        <!-- Historial Médico -->
        <section id="section-historial" class="section">
            <h2>Historial Médico</h2>

            <!-- Tabla de registros clínicos -->
            <div id="historialCardsContainer" class="cards-container"></div>


            <!-- Formulario para agregar nuevo historial -->
            <h3>Agregar Registro Clínico / Historial</h3>
            <form id="addHistorialForm" class="form-card" enctype="multipart/form-data">
                <label>Cita (selecciona paciente y funcionario automáticamente)</label>
                <select name="cita_id" id="citaSelect" required>
                    <option value="">Seleccione una cita</option>
                </select>

                <label>Paciente</label>
                <input type="text" id="pacienteNombre" readonly>

                <label>Funcionario</label>
                <input type="text" id="funcionarioNombre" readonly>

                <label>Fecha inicio</label>
                <input type="date" id="fechaInicio" readonly>

                <label>Fecha fin (opcional)</label>
                <input type="date" id="fechaFin" readonly>

                <label>Tipo</label>
                <select name="tipo" required>
                    <option value="">Seleccionar tipo</option>
                    <option value="consulta">Consulta</option>
                    <option value="tratamiento">Tratamiento</option>
                    <option value="procedimiento">Procedimiento</option>
                </select>

                <label>Descripción / Qué se le hizo</label>
                <textarea name="descripcion" rows="4" placeholder="Descripción detallada" required></textarea>

                <label>Observaciones</label>
                <textarea name="observaciones" rows="3" placeholder="Observaciones (opcional)"></textarea>

                <label>Tratamiento prescrito</label>
                <textarea name="tratamiento_prescrito" rows="2" placeholder="Tratamiento (opcional)"></textarea>

                <label>Archivos / Imágenes (placas, radiografías, etc.)</label>
                <input type="file" name="imagenes[]" accept="image/*,application/pdf" multiple>
                <small class="muted">Puedes subir múltiples imágenes o PDFs relacionados al registro.</small>

                <button type="submit" class="btn">Agregar Historial / Registro</button>
            </form>

            <!-- Solicitudes de historial -->
            <h3>Solicitudes de Historial (pendientes)</h3>
            <div id="historialRequestsList" class="cards-container">
                <p>Cargando solicitudes...</p>
            </div>
        </section>

        <!-- Facturación -->
        <section id="section-facturacion" class="section">
            <h2>Facturación</h2>
            <div id="facturasList" class="cards-container"></div>

            <h3>Agregar Factura</h3>
            <form id="addFacturaForm" class="form-card">
                <select name="paciente_id" required>
                    <option value="">Seleccione paciente</option>
                    <?php foreach($pacientes as $p): ?>
                        <option value="<?= htmlspecialchars($p['id_paciente']) ?>"><?= htmlspecialchars($p['nombre'] . ' ' . $p['apellido']) ?></option>
                    <?php endforeach; ?>
                </select>
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
                <button id="sendAllCitas" class="btn">Enviar a todos</button>
            </div>
            <div class="messages-card">
                <h3>Felicidades de cumpleaños</h3>
                <textarea id="mensajeCumple" placeholder="Mensaje predeterminado de cumpleaños"></textarea>
                <button id="sendAllCumple" class="btn">Enviar a todos</button>
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
                <img id="previewFoto"
                    src="<?= htmlspecialchars($fotoRecepcionista) ?>"
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
