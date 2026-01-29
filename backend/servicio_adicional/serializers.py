# servicio_adicional/serializers.py

from rest_framework import serializers
from .models import ServicioAdicional

class ServicioAdicionalSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo ServicioAdicional.
    """
    class Meta:
        model = ServicioAdicional
        fields = '__all__'
        read_only_fields = ['id']