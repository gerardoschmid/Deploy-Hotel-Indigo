from rest_framework import viewsets
from .models import MenuPlato
from .serializers import MenuPlatoSerializer

class MenuPlatoViewSet(viewsets.ModelViewSet):
    queryset = MenuPlato.objects.all()
    serializer_class = MenuPlatoSerializer