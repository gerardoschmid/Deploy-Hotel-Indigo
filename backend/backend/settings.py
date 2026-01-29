"""
Django settings for backend project.
"""

from pathlib import Path
from datetime import timedelta
import os
import dj_database_url 

# Directorio Base
BASE_DIR = Path(__file__).resolve().parent.parent

# =========================================================
# CONFIGURACIÓN DINÁMICA (LOCAL VS PRODUCCIÓN)
# =========================================================

SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-w!$3l8jil4pitlum0+od0kygszh%$j$&855)5nh@jcvtel=56!')

DEBUG = os.environ.get('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = [
    'hotel-reserva-test-production.up.railway.app', 
    'hote-frontend-production.up.railway.app',
    'localhost', 
    '127.0.0.1',
    '*' 
]

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',          
    'rest_framework_simplejwt', 
    'corsheaders',               
    'salon_eventos',
    'reserva_salon',
    'usuarios',
    'habitacion',
    'tarifa_dinamica',
    'reserva_habitacion',
    'servicio_adicional',
    'reserva_servicio',
    'atencion_cliente',
    'restaurante_mesa',
    'reserva_restaurante',
    'menu_restaurante',
    'plato',
    'menu_plato',
    'insumo_producto',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', 
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', 
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware', 
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# =========================================================
# BASE DE DATOS
# =========================================================
DATABASES = {
    'default': dj_database_url.config(
        default='sqlite:///db.sqlite3',
        conn_max_age=600
    )
}

# Internacionalización
LANGUAGE_CODE = 'es-es'
TIME_ZONE = 'America/Caracas' 
USE_I18N = True
USE_TZ = True

# Archivos Estáticos
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    )
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# =========================================================
# CORS Y CSRF
# =========================================================
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://hote-frontend-production.up.railway.app",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "https://hote-frontend-production.up.railway.app",
    "https://hotel-reserva-test-production.up.railway.app",
]

# Configuración de Cookies para Producción
if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_SAMESITE = 'None' 
else:
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False
    SESSION_COOKIE_SAMESITE = 'Lax'

SESSION_COOKIE_HTTPONLY = True
SESSION_SAVE_EVERY_REQUEST = True 

# =========================================================
# CONFIGURACIÓN CORREO (MODO EMAILJS)
# =========================================================
# Las credenciales (SERVICE_ID, TEMPLATE_ID, etc.) se leen 
# directamente en views.py desde las variables de entorno.

# Usamos el backend 'dummy' para desactivar el SMTP nativo de Django
# y evitar que intente conexiones bloqueadas por el puerto 587/465.
EMAIL_BACKEND = 'django.core.mail.backends.dummy.EmailBackend'
