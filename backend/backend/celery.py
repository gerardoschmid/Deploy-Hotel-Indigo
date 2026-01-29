# proyectohotel/backend/celery.py

import os
from celery import Celery

# 1. Establecer la configuración por defecto de Django
# 'backend' debe ser el nombre de la carpeta donde está settings.py
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# 2. Crear una instancia de la aplicación Celery
app = Celery('backend')

# 3. Cargar la configuración de Celery desde el archivo settings.py
# El prefijo 'CELERY' le dice a Celery que use cualquier variable 
# de configuración que comience con CELERY_ (ej. CELERY_BROKER_URL).
app.config_from_object('django.conf.settings', namespace='CELERY')

# 4. Descubrimiento Automático de Tareas
# Celery buscará automáticamente tareas en archivos llamados 'tasks.py' 
# dentro de todas las aplicaciones registradas.
app.autodiscover_tasks()