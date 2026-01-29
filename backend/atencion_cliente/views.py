from rest_framework import viewsets
from .models import AtencionCliente
from .serializers import AtencionClienteSerializer

class AtencionClienteViewSet(viewsets.ModelViewSet):
    queryset = AtencionCliente.objects.all()
    serializer_class = AtencionClienteSerializer