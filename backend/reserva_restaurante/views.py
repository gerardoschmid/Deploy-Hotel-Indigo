import logging
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import ReservaRestaurante
from .serializers import ReservaRestauranteSerializer
from .task import enviar_email_restaurante

# Configurar logger para ver errores en la consola de Railway
logger = logging.getLogger(__name__)

class ReservaRestauranteViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar las reservas del restaurante.
    Incluye protección contra fallos de Celery/Redis y filtrado por usuario.
    """
    serializer_class = ReservaRestauranteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Sobrescribimos el queryset para que los clientes solo vean sus propias reservas.
        Admin y Recepcionista mantienen acceso total.
        """
        user = self.request.user
        
        # 1. Si es staff (is_staff) o tiene rol administrativo en su perfil, ve todo
        if user.is_staff or (hasattr(user, 'perfil') and user.perfil.rol in ['ADMINISTRADOR', 'RECEPCIONISTA']):
            return ReservaRestaurante.objects.all().select_related('usuario', 'mesa')
        
        # 2. Si es un cliente normal, filtramos por su usuario
        return ReservaRestaurante.objects.filter(usuario=user).select_related('usuario', 'mesa')

    def create(self, request, *args, **kwargs):
        # Sobrescribimos create para asegurar el manejo de errores global
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error general en creación de reserva: {e}")
            return Response(
                {"error": "Error interno, pero verifica tus reservas."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_create(self, serializer):
        # 1. Guardamos la instancia asignando el usuario autenticado
        instance = serializer.save(usuario=self.request.user)
        
        # 2. Intentamos enviar el correo de forma segura con Celery
        try:
            print(f"DEBUG: Reserva {instance.codigo_reserva} creada. Intentando enviar a Celery...")
            enviar_email_restaurante.delay(instance.pk)
        except Exception as e:
            # Si falla Celery, la reserva ya está guardada, solo logueamos el error
            logger.error(f"⚠️ ERROR AL ENVIAR TAREA A CELERY: {str(e)}")
            print(f"⚠️ FALLÓ EL EMAIL: {e}")