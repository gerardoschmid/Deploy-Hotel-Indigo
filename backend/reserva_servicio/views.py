# reserva_servicio/views.py (CORREGIDO)

from rest_framework import viewsets
from .models import ServicioReserva
from .serializers import ServicioReservaSerializer
# Importamos todos los permisos relevantes
from usuarios.permissions import IsAdministrador, IsRecepcionista, IsOwnerOrAdmin
from rest_framework import permissions

class ServicioReservaViewSet(viewsets.ModelViewSet):
    
    # Optimizamos el queryset y usamos .all() para que los filtros de usuario/reserva se apliquen en get_queryset
    queryset = ServicioReserva.objects.all().select_related('reserva_habitacion', 'servicio')
    serializer_class = ServicioReservaSerializer
    
    # 1. Filtro de Queryset por Usuario
    def get_queryset(self):
        user = self.request.user
        
        # El administrador y recepcionista ven TODO
        if IsAdministrador().has_permission(self.request, self) or IsRecepcionista().has_permission(self.request, self):
            return self.queryset
        
        # El cliente solo ve los servicios de SUS PROPIAS reservas
        if user.is_authenticated:
            return self.queryset.filter(reserva_habitacion__usuario=user)
            
        return self.queryset.none()
    
    # 2. Permisos dinámicos por Acción
    def get_permissions(self):
        # Listar y Crear requiere que el usuario esté autenticado (el cliente puede crear sus propios servicios)
        if self.action in ['list', 'create']:
            self.permission_classes = [permissions.IsAuthenticated]
        
        # Ver detalle, Actualizar, o Eliminar requiere ser Administrador o Dueño de la Reserva (Owner)
        elif self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            # Nota: IsOwnerOrAdmin necesita ser implementado en has_object_permission
            # para verificar la propiedad a través de la ReservaHabitacion.
            # Temporalmente, solo lo permitiremos al Staff para evitar bugs de implementación de objeto.
            # El cliente solo debería poder crear, no modificar/eliminar después de crear.
            self.permission_classes = [IsRecepcionista] 
        else:
            self.permission_classes = [permissions.IsAuthenticated]
            
        return super().get_permissions()