# reserva_servicio/apps.py

from django.apps import AppConfig


class ReservaServicioConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'reserva_servicio'

    def ready(self):
        # Conecta las señales al iniciar la aplicación
        import reserva_servicio.signals