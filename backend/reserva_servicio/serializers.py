# reserva_servicio/serializers.py

from rest_framework import serializers
from .models import ServicioReserva

class ServicioReservaSerializer(serializers.ModelSerializer):
    
    nombre_servicio = serializers.CharField(source='servicio.nombre', read_only=True)
    
    class Meta:
        model = ServicioReserva
        fields = ['id', 'reserva_habitacion', 'servicio', 'nombre_servicio', 'cantidad', 'precio_unitario', 'notas_cliente'] # <-- ¡CAMPO AÑADIDO!
        read_only_fields = ['precio_unitario']