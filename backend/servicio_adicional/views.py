# servicio_adicional/views.py

from rest_framework import viewsets, permissions
from .models import ServicioAdicional
from .serializers import ServicioAdicionalSerializer
from usuarios.permissions import IsAdministrador # Permiso para Staff


class ServicioAdicionalViewSet(viewsets.ModelViewSet):
    
    # 1. Definir el queryset base SIN FILTROS para que el POST funcione
    queryset = ServicioAdicional.objects.all() 
    serializer_class = ServicioAdicionalSerializer
    
    
    def get_permissions(self):
        # Permite ver la lista y el detalle (lectura) a CUALQUIERA
        if self.action in ['list', 'retrieve']:
            self.permission_classes = [permissions.AllowAny] 
        # Para crear (POST), actualizar (PUT/PATCH) o eliminar (DELETE), SOLO Administrador
        else:
            self.permission_classes = [IsAdministrador] 
            
        return super().get_permissions()

    
    def get_queryset(self):
        # Aplicar el filtro 'activo=True' SÓLO a las acciones de lectura
        if self.action in ['list', 'retrieve']:
            return self.queryset.filter(activo=True).order_by('tipo', 'nombre')
        # Para el Administrador, devuelve todos (incluidos inactivos)
        return self.queryset.order_by('tipo', 'nombre')