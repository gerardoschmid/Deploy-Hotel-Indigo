from rest_framework import viewsets
from .models import InsumoProducto
from .serializers import InsumoProductoSerializer

class InsumoProductoViewSet(viewsets.ModelViewSet):
    queryset = InsumoProducto.objects.all()
    serializer_class = InsumoProductoSerializer