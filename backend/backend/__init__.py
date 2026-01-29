# proyectohotel/backend/backend/__init__.py

# Usamos la importación RELATIVA nuevamente para que manage.py la encuentre.
# El error anterior de Pylance fue una advertencia, no un error de ejecución.
from .celery import app as celery_app 

__all__ = ('celery_app',)