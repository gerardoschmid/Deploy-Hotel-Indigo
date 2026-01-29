from rest_framework import serializers
from .models import ReservaRestaurante
from datetime import timedelta

class ReservaRestauranteSerializer(serializers.ModelSerializer):
    # --- AGREGADO: Obtenemos el username Y el email del usuario ---
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    usuario_email = serializers.EmailField(source='usuario.email', read_only=True) # <--- NUEVO
    
    numero_mesa = serializers.CharField(source='mesa.numero_mesa', read_only=True)

    class Meta:
        model = ReservaRestaurante
        fields = [
            'id', 'usuario', 'usuario_username', 'usuario_email', # <--- AGREGAR AQUÍ
            'mesa', 'numero_mesa', 
            'fecha_reserva', 'cantidad_personas', 'codigo_reserva', 
            'estado', 'notas', 'fecha_creacion'
        ]
        read_only_fields = ['usuario', 'codigo_reserva', 'fecha_creacion']

    def validate_cantidad_personas(self, value):
        if value <= 0:
            raise serializers.ValidationError("La cantidad de personas debe ser al menos 1.")
        return value

    def validate(self, data):
        """
        Validación para evitar solapamiento de horarios (Regla de 2 horas).
        """
        if self.instance:
            mesa = data.get('mesa', self.instance.mesa)
            fecha_inicio_nueva = data.get('fecha_reserva', self.instance.fecha_reserva)
        else:
            mesa = data.get('mesa')
            fecha_inicio_nueva = data.get('fecha_reserva')

        if not mesa or not fecha_inicio_nueva:
            return data

        duracion = timedelta(hours=2)
        fecha_fin_nueva = fecha_inicio_nueva + duracion

        reservas_existentes = ReservaRestaurante.objects.filter(
            mesa=mesa,
            estado__in=['pendiente', 'confirmada'] 
        )
        
        if self.instance:
            reservas_existentes = reservas_existentes.exclude(pk=self.instance.pk)

        for reserva in reservas_existentes:
            inicio_existente = reserva.fecha_reserva
            fin_existente = inicio_existente + duracion

            if fecha_inicio_nueva < fin_existente and fecha_fin_nueva > inicio_existente:
                raise serializers.ValidationError({
                    "mesa": [f"La mesa {mesa.numero_mesa} ya está reservada en este horario. (Bloqueo de 2 horas)."]
                })

        return data