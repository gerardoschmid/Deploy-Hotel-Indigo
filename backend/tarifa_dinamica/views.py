# tarifa_dinamica/views.py

from rest_framework import viewsets
from .models import TarifaDinamica
from .serializers import TarifaDinamicaSerializer
# Asumo que ya tienes implementados los permisos en tu app 'usuarios'
from usuarios.permissions import IsAdministrador # Ejemplo de permiso para CRUD

class TarifaDinamicaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para la gestión de Tarifas Dinámicas.
    Permite el CRUD de tarifas dinámicas.
    """
    queryset = TarifaDinamica.objects.all().select_related('habitacion')
    serializer_class = TarifaDinamicaSerializer
    
    # Restringe el acceso al CRUD solo a Administradores (o el rol que definas)
    permission_classes = [IsAdministrador] 
    
    # Opcional: Anulación para solo permitir lectura a otros roles
    # def get_permissions(self):
    #     if self.action in ['list', 'retrieve']:
    #         # Permitir a recepcionistas ver las tarifas
    #         return [IsRecepcionista()]
    #     return [IsAdministrador()]