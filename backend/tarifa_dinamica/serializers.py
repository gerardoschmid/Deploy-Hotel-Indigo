# tarifa_dinamica/serializers.py

from rest_framework import serializers
from .models import TarifaDinamica

class TarifaDinamicaSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo TarifaDinamica.
    """
    # Campo de solo lectura para mostrar el número de habitación
    numero_habitacion = serializers.CharField(source='habitacion.numero_habitacion', read_only=True)
    
    class Meta:
        model = TarifaDinamica
        fields = '__all__'
        # Campos que se pueden usar para crear o actualizar
        # read_only_fields = ['id']