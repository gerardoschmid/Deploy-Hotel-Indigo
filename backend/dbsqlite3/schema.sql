PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password_hash TEXT,
    nombre TEXT,
    apellido TEXT,
    telefono TEXT,
    documento_identidad TEXT,
    rol TEXT,
    fecha_creacion TEXT,
    estado TEXT
);

CREATE TABLE IF NOT EXISTS salon_eventos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    descripcion TEXT,
    capacidad INTEGER,
    comodidades TEXT,
    precio_base_hora REAL,
    galeria_fotos TEXT,
    activo INTEGER
);

CREATE TABLE IF NOT EXISTS reserva_salon (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER,
    salon_id INTEGER,
    fecha_evento TEXT,
    hora_inicio TEXT,
    hora_fin TEXT,
    numero_personas INTEGER,
    tipo_evento TEXT,
    estado TEXT,
    codigo_confirmacion TEXT UNIQUE,
    total REAL,
    fecha_creacion TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    FOREIGN KEY (salon_id) REFERENCES salon_eventos(id)
);

CREATE TABLE IF NOT EXISTS habitacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_habitacion TEXT UNIQUE,
    piso INTEGER,
    tipo_ocupacion TEXT,
    tamano_cama TEXT,
    categoria TEXT,
    caracteristicas TEXT,
    descripcion TEXT,
    estado TEXT,
    precio_base REAL,
    activa INTEGER
);

CREATE TABLE IF NOT EXISTS tarifa_dinamica (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habitacion_id INTEGER,
    tipo_temporada TEXT,
    precio REAL,
    fecha_inicio TEXT,
    fecha_fin TEXT,
    descuento REAL,
    FOREIGN KEY (habitacion_id) REFERENCES habitacion(id)
);

CREATE TABLE IF NOT EXISTS reserva_habitacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER,
    habitacion_id INTEGER,
    fecha_checkin TEXT,
    fecha_checkout TEXT,
    numero_huespedes INTEGER,
    estado TEXT,
    codigo_confirmacion TEXT UNIQUE,
    servicios_adicionales TEXT,
    total REAL,
    fecha_creacion TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    FOREIGN KEY (habitacion_id) REFERENCES habitacion(id)
);

CREATE TABLE IF NOT EXISTS servicio_adicional (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    descripcion TEXT,
    precio REAL,
    tipo TEXT,
    activo INTEGER
);

CREATE TABLE IF NOT EXISTS reserva_servicio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reserva_habitacion_id INTEGER,
    servicio_id INTEGER,
    cantidad INTEGER,
    precio_unitario REAL,
    FOREIGN KEY (reserva_habitacion_id) REFERENCES reserva_habitacion(id),
    FOREIGN KEY (servicio_id) REFERENCES servicio_adicional(id)
);

CREATE TABLE IF NOT EXISTS atencion_cliente (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER,
    tipo_atencion TEXT,
    descripcion TEXT,
    estado TEXT,
    fecha_creacion TEXT,
    fecha_resolucion TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

CREATE TABLE IF NOT EXISTS restaurante_mesa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_mesa TEXT UNIQUE,
    capacidad INTEGER,
    ubicacion TEXT,
    estado TEXT,
    activa INTEGER
);

CREATE TABLE IF NOT EXISTS reserva_restaurante (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER,
    mesa_id INTEGER,
    fecha_reserva TEXT,
    hora_reserva TEXT,
    numero_personas INTEGER,
    preferencias TEXT,
    estado TEXT,
    codigo_confirmacion TEXT UNIQUE,
    fecha_creacion TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    FOREIGN KEY (mesa_id) REFERENCES restaurante_mesa(id)
);

CREATE TABLE IF NOT EXISTS menu_restaurante (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    descripcion TEXT,
    tipo TEXT,
    precio REAL,
    activo INTEGER
);

CREATE TABLE IF NOT EXISTS plato (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    descripcion TEXT,
    ingredientes TEXT,
    alergenos TEXT,
    precio REAL,
    categoria TEXT,
    foto_url TEXT,
    activo INTEGER
);

CREATE TABLE IF NOT EXISTS menu_plato (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    menu_id INTEGER,
    plato_id INTEGER,
    orden INTEGER,
    FOREIGN KEY (menu_id) REFERENCES menu_restaurante(id),
    FOREIGN KEY (plato_id) REFERENCES plato(id)
);

CREATE TABLE IF NOT EXISTS insumo_producto (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    descripcion TEXT,
    costo_compra REAL,
    costo_venta REAL,
    stock_inicial INTEGER,
    stock_actual INTEGER,
    marca TEXT,
    color TEXT,
    fecha_vencimiento TEXT,
    estado TEXT
);

-- indices básicos para acelerar búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_reserva_habitacion_usuario ON reserva_habitacion(usuario_id);
CREATE INDEX IF NOT EXISTS idx_reserva_salon_usuario ON reserva_salon(usuario_id);
CREATE INDEX IF NOT EXISTS idx_reserva_restaurante_usuario ON reserva_restaurante(usuario_id);
