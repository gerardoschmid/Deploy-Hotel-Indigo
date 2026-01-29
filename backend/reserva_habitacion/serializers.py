# reserva_habitacion/serializers.py

from rest_framework import serializers
from .models import ReservaHabitacion
from habitacion.models import Habitacion 
from django.utils import timezone 
from django.db.models import Q 

class ReservaHabitacionSerializer(serializers.ModelSerializer):
    
    # Campos informativos de solo lectura para el Frontend
    usuario_username = serializers.CharField(source='usuario.username', read_only=True) 
    numero_habitacion = serializers.CharField(source='habitacion.numero_habitacion', read_only=True)
    
    class Meta:
       model = ReservaHabitacion
       fields = '__all__'
    # Elimina 'usuario' de aquí:
       read_only_fields = ['codigo_confirmacion', 'total', 'fecha_creacion']

    def validate(self, data):
        """
        Implementa las validaciones de negocio para la reserva.
        """
        fecha_checkin = data.get('fecha_checkin')
        fecha_checkout = data.get('fecha_checkout')
        habitacion = data.get('habitacion')
        
        # Validar que los datos existan (en caso de actualizaciones parciales)
        if not fecha_checkin or not fecha_checkout or not habitacion:
            return data

        # OBTENCIÓN DE FECHA ACTUAL (CORRECCIÓN CRÍTICA PARA TIMEZONES):
        today = timezone.localdate() 
        
        # =========================================================
        # 1. RESTRICCIÓN: No Fecha Anterior a la Actual
        # =========================================================
        if fecha_checkin < today:
             raise serializers.ValidationError({
                 'fecha_checkin': 'No se puede reservar una habitación con fecha anterior a la actual.'
             })

        # Validación: Check-out debe ser posterior al Check-in
        if fecha_checkin >= fecha_checkout:
            raise serializers.ValidationError({
                'fecha_checkout': 'El check-out debe ser posterior al check-in.'
            })
            
        # =========================================================
        # 2. RESTRICCIÓN: Solo Habitación con Estado Disponible
        # =========================================================
        # Solo validamos el estado de la habitación si es una reserva nueva
        if not self.instance and habitacion.estado != Habitacion.ESTADO_DISPONIBLE:
             raise serializers.ValidationError({
                'habitacion': f'La habitación {habitacion.numero_habitacion} no está disponible. Su estado actual es: {habitacion.get_estado_display()}.'
            })

        # =========================================================
        # 3. VALIDACIÓN DE DISPONIBILIDAD (Superposición de fechas)
        # =========================================================
        superpuestas = ReservaHabitacion.objects.filter(
            habitacion=habitacion,
            fecha_checkin__lt=fecha_checkout, 
            fecha_checkout__gt=fecha_checkin,
            # Solo se consideran conflictos reservas que no estén canceladas
            estado__in=[ReservaHabitacion.ESTADO_PENDIENTE, ReservaHabitacion.ESTADO_CONFIRMADA] 
        )
        
        # Si estamos editando una reserva, excluimos la reserva actual de la búsqueda de conflictos
        if self.instance: 
            superpuestas = superpuestas.exclude(pk=self.instance.pk)

        if superpuestas.exists():
            raise serializers.ValidationError({
                'habitacion': f'Habitación {habitacion.numero_habitacion} no disponible en ese rango de fechas (ya existe una reserva activa).'
            })

        if superpuestas.exists():
            raise serializers.ValidationError({
                'habitacion': f'Habitación {habitacion.numero_habitacion} no disponible en ese rango de fechas (ya existe una reserva activa).'
            })

        return data

    def to_representation(self, instance):
        """
        Sobreescribimos para devolver objetos completos en usuario y habitacion
        para que el frontend pueda mostrar username, email, categoria, etc.
        """
        response = super().to_representation(instance)
        
        # Usuario
        if instance.usuario:
            response['usuario'] = {
                'id': instance.usuario.id,
                'username': instance.usuario.username,
                'email': instance.usuario.email,
                'first_name': instance.usuario.first_name,
                'last_name': instance.usuario.last_name,
            }
        else:
             response['usuario'] = None

        # Habitación
        if instance.habitacion:
            response['habitacion'] = {
                'id': instance.habitacion.id,
                'numero_habitacion': instance.habitacion.numero_habitacion,
                'categoria': instance.habitacion.categoria,
                'precio_base': instance.habitacion.precio_base,
            }
        else:
            response['habitacion'] = None
            
        return response