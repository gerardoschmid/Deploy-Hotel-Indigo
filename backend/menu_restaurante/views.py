from rest_framework import viewsets
from .models import MenuRestaurante
from .serializers import MenuRestauranteSerializer

class MenuRestauranteViewSet(viewsets.ModelViewSet):
    queryset = MenuRestaurante.objects.all()
    serializer_class = MenuRestauranteSerializer