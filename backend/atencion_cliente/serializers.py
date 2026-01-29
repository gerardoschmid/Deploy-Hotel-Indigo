from rest_framework import serializers
from .models import AtencionCliente

class AtencionClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = AtencionCliente
        fields = '__all__'