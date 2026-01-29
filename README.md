# Hotel Indigo - Sistema de Gestión

## Requisitos Previos
- Python 3.8 o superior
- Node.js 16 o superior
- Git (opcional)

## Instalación Automática

### Opción 1: Instalación con script (Recomendado)
1. Abre una terminal como administrador
2. Navega a la carpeta del proyecto
3. Ejecuta: `instalar.bat`
4. Sigue las instrucciones en pantalla

### Opción 2: Instalación Manual

#### Backend (Django)
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt

# Configurar variables de entorno
copy .env.example .env
# Editar .env con tu configuración

python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser  # Opcional
```

#### Frontend (React)
```bash
cd frontend
npm install
npm audit fix
```

## Ejecución

### Opción 1: Script automático
```bash
ejecutar.bat
```

### Opción 2: Manual
Abre dos terminales:

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## URLs de Acceso
- **Frontend:** http://localhost:5173
- **Backend API:** http://127.0.0.1:8000
- **Admin Django:** http://127.0.0.1:8000/admin

## Configuración de Variables de Entorno

El proyecto ahora usa variables de entorno para mayor seguridad:

1. Copia `backend/.env.example` a `backend/.env`
2. Ajusta los valores según tu configuración
3. **Importante**: Cambia `SECRET_KEY` en producción

## Estructura del Proyecto
```
proyecto-hotel/
├── backend/          # API Django REST
│   ├── .env.example # Plantilla de variables de entorno
│   └── requirements.txt
├── frontend/         # Aplicación React
│   ├── package.json
│   └── vite.config.js
├── instalar.bat     # Script de instalación mejorado
├── ejecutar.bat     # Script de ejecución
└── README.md        # Este archivo
```

## Mejoras de Seguridad Implementadas

- ✅ Variables de entorno para configuración sensible
- ✅ Actualización de dependencias a últimas versiones estables
- ✅ Auditoría de seguridad en dependencias de frontend
- ✅ Configuración CORS mejorada
- ✅ Soporte para PostgreSQL (opcional)

## Solución de Problemas

### Error: Python no encontrado
- Instala Python desde https://python.org
- Asegúrate de marcar "Add to PATH" durante la instalación

### Error: Node.js no encontrado
- Instala Node.js desde https://nodejs.org

### Error de permisos
- Ejecuta la terminal como administrador

### Error con variables de entorno
- Verifica que el archivo `.env` exista en `backend/`
- Copia desde `.env.example` si no existe

## Desarrollo
- El backend usa SQLite por defecto (configurable a PostgreSQL)
- Celery configurado para desarrollo (sin Redis requerido)
- CORS habilitado para desarrollo local
- Imágenes y archivos estáticos configurados

## Actualizaciones Recientes
- Actualización de dependencias de Django y React
- Mejoras de seguridad con variables de entorno
- Configuración mejorada de CORS
- Soporte para PostgreSQL en producción