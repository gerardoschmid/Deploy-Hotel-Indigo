from rest_framework import serializers
from .models import ReservaSalon
from django.utils import timezone

class ReservaSalonSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo ReservaSalon.
    Maneja la visualización de datos relacionados y protege campos generados por el sistema.
    """
    # --- AGREGADO: Obtenemos el username Y el email del usuario ---
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    usuario_email = serializers.EmailField(source='usuario.email', read_only=True) # <--- NUEVO
    
    nombre_salon = serializers.CharField(source='salon.nombre', read_only=True)

    class Meta:
        model = ReservaSalon
        fields = [
            'id', 'usuario', 'usuario_username', 'usuario_email', # <--- AGREGAR AQUÍ
            'salon', 'nombre_salon', 
            'fecha_evento', 'cantidad_invitados', 'codigo_evento', 
            'estado', 'total_reserva', 'fecha_creacion'
        ]
        read_only_fields = ['usuario', 'codigo_evento', 'fecha_creacion']

    def validate_fecha_evento(self, value):
        if value < timezone.now():
            raise serializers.ValidationError("La fecha del evento no puede ser en el pasado.")
        return value

    def validate_cantidad_invitados(self, value):
        if value <= 0:
            raise serializers.ValidationError("El número de invitados debe ser al menos 1.")
        return value