# Configuración de API - Frontend

## Endpoints Disponibles

### Autenticación
- `POST /api/auth/register/` - Registro de nuevos usuarios
- `POST /api/token/` - Login de usuarios (devuelve access, refresh y user)
- `POST /api/token/refresh/` - Refrescar token de acceso

### Usuarios
- `GET /api/usuarios/perfiles/` - Obtener perfil del usuario actual
- `GET /api/usuarios/gestion/` - Listar usuarios (admin)
- `POST /api/usuarios/gestion/` - Crear usuario (admin)
- `PUT /api/usuarios/gestion/{id}/` - Actualizar usuario (admin)
- `DELETE /api/usuarios/gestion/{id}/` - Eliminar usuario (admin)

## Ejemplos de Uso

### Registro de Usuario
```javascript
const userData = {
  username: "nuevo_usuario",
  email: "usuario@ejemplo.com",
  password: "contraseña123",
  first_name: "Nombre",
  last_name: "Apellido"
};

const response = await api.post('/api/auth/register/', userData);
```

### Login
```javascript
const credentials = {
  username: "usuario",
  password: "contraseña"
};

const response = await api.post('/api/token/', credentials);
// Response: { access: "...", refresh: "...", user: {...} }
```

### Acceso a Rutas Protegidas
```javascript
// El token se agrega automáticamente desde localStorage
const response = await api.get('/api/usuarios/perfiles/');
```

## Configuración

### Desarrollo
- Base URL: `http://127.0.0.1:8000/`
- Asegúrate de que el backend Django esté corriendo

### Producción
- Cambia `NODE_ENV=production` o modifica `src/config/api.js`
- Actualiza la URL de producción

## Flujo de Autenticación

1. **Registro**: `POST /api/auth/register/`
2. **Login**: `POST /api/token/` → guarda tokens y user data
3. **Acceso**: Usa el token access en las peticiones
4. **Refresh**: Si el token expira, usa `POST /api/token/refresh/`
5. **Logout**: Elimina tokens del localStorage

## Manejo de Errores

- 401: No autorizado → redirigir a login
- 403: Prohibido → sin permisos
- 400: Bad Request → datos inválidos
- 500: Error del servidor

## Roles de Usuario

- `admin`: Usuarios con `is_staff=True`
- `cliente`: Usuarios regulares
