from rest_framework import serializers
from .models import InsumoProducto

class InsumoProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = InsumoProducto
        fields = '__all__'