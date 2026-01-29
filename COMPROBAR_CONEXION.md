# Comprobación de Conexión Frontend-Backend

## ✅ Problema Solucionado

Tu API de backend ahora está correctamente conectada con el frontend.

## 📋 Cambios Realizados

### Backend (Django)
1. **Serializador actualizado**: `usuarios/serializers.py`
   - Ahora devuelve `user` con datos completos en el login
   - Incluye: id, username, email, first_name, last_name, rol

2. **Endpoints configurados**:
   - `/api/auth/register/` - Registro
   - `/api/token/` - Login (con datos de usuario)
   - `/api/token/refresh/` - Refresh token

### Frontend (React)
1. **AuthContext actualizado**: `src/context/AuthContext.jsx`
   - Conexión real con el backend (eliminado modo simulado)
   - Login usa `/api/token/`
   - Registro usa `/api/auth/register/`
   - Manejo de tokens access y refresh

2. **Axios configurado**: `src/api/axios.js`
   - Configuración dinámica de API URL
   - Interceptor para refresh token automático
   - Manejo de errores 401

3. **Configuración de entorno**: `src/config/api.js`
   - Soporte para desarrollo y producción
   - Fácil cambio de URL base

## 🧪 Pruebas

Ejecuta el script de prueba:
```bash
python test_api.py
```

## 🚀 Para Usar

1. **Iniciar backend**:
   ```bash
   cd backend
   python manage.py runserver
   ```

2. **Iniciar frontend**:
   ```bash
   cd frontend
   npm start
   ```

3. **Probar registro y login** en la aplicación

## 📡 Endpoints Funcionando

- ✅ `POST /api/auth/register/` - Registro de usuarios
- ✅ `POST /api/token/` - Login con datos de usuario
- ✅ `POST /api/token/refresh/` - Refrescar token
- ✅ `GET /api/usuarios/perfiles/` - Perfil de usuario

## 🔧 Configuración Adicional

Para producción, edita `frontend/src/config/api.js` y cambia la URL de producción.
