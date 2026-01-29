from rest_framework import viewsets
from .models import SalonEvento
from .serializers import SalonEventoSerializer

class SalonEventoViewSet(viewsets.ModelViewSet):
    """
    ViewSet simple para gestionar salones - como habitaciones
    """
    queryset = SalonEvento.objects.all()
    serializer_class = SalonEventoSerializer