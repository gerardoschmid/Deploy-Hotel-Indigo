# habitacion/views.py
from rest_framework import viewsets, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q

# Solo importamos el modelo y serializer de Habitacion
from .models import Habitacion
from .serializers import HabitacionSerializer

class HabitacionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar habitaciones.
    Soporta subida de imagen directa en el campo 'imagen' del modelo Habitacion.
    """
    queryset = Habitacion.objects.all()
    serializer_class = HabitacionSerializer
    
    # ⚠️ IMPORTANTE: Permite recibir archivos (imágenes) y datos de formulario a la vez
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)
    
    def get_queryset(self):
        """
        Filtros simples por parámetros URL
        """
        queryset = Habitacion.objects.all()
        
        # Filtro por estado
        estado = self.request.query_params.get('estado')
        if estado:
            queryset = queryset.filter(estado=estado)
        
        # Filtro por piso
        piso = self.request.query_params.get('piso')
        if piso:
            queryset = queryset.filter(piso=piso)
        
        # Filtro por categoría
        categoria = self.request.query_params.get('categoria')
        if categoria:
            queryset = queryset.filter(categoria=categoria)
        
        # Filtro por tipo de ocupación
        tipo_ocupacion = self.request.query_params.get('tipo_ocupacion')
        if tipo_ocupacion:
            queryset = queryset.filter(tipo_ocupacion=tipo_ocupacion)
        
        # Filtro por precio máximo
        precio_max = self.request.query_params.get('precio_max')
        if precio_max:
            queryset = queryset.filter(precio_base__lte=precio_max)
        
        # Filtro por precio mínimo
        precio_min = self.request.query_params.get('precio_min')
        if precio_min:
            queryset = queryset.filter(precio_base__gte=precio_min)
        
        # Solo habitaciones activas por defecto
        mostrar_inactivas = self.request.query_params.get('mostrar_inactivas')
        if not mostrar_inactivas:
            queryset = queryset.filter(activa=True)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def disponibles(self, request):
        """
        Endpoint simple para habitaciones disponibles
        """
        habitaciones = Habitacion.objects.filter(
            estado='disponible', 
            activa=True
        )
        
        # Aplicar filtros adicionales si existen
        categoria = request.query_params.get('categoria')
        if categoria:
            habitaciones = habitaciones.filter(categoria=categoria)
        
        tipo_ocupacion = request.query_params.get('tipo_ocupacion')
        if tipo_ocupacion:
            habitaciones = habitaciones.filter(tipo_ocupacion=tipo_ocupacion)
        
        precio_max = request.query_params.get('precio_max')
        if precio_max:
            habitaciones = habitaciones.filter(precio_base__lte=precio_max)
        
        serializer = self.get_serializer(habitaciones, many=True)
        return Response({
            'total': habitaciones.count(),
            'habitaciones': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def cambiar_estado(self, request, pk=None):
        """
        Cambiar estado de una habitación
        """
        habitacion = self.get_object()
        nuevo_estado = request.data.get('estado')
        
        # Validar que el estado sea válido
        estados_validos = ['disponible', 'ocupada', 'limpieza', 'mantenimiento']
        if nuevo_estado not in estados_validos:
            return Response(
                {'error': f'Estado no válido. Estados permitidos: {estados_validos}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        habitacion.estado = nuevo_estado
        habitacion.save()
        
        serializer = self.get_serializer(habitacion)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """
        Sobrescribir eliminación para manejar errores de integridad (reservas existentes)
        """
        try:
            instance = self.get_object()
            
            # Verificar si tiene reservas activas
            if hasattr(instance, 'reservas'):
                reservas_activas = instance.reservas.exclude(
                    estado__in=['cancelada', 'completada']
                ).exists()
                
                if reservas_activas:
                    return Response(
                        {'error': 'No se puede eliminar la habitación porque tiene reservas activas.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except Exception as e:
            if 'foreign key constraint' in str(e).lower() or 'protected' in str(e).lower():
                 return Response(
                    {'error': 'No se puede eliminar por historial de reservas. Desactívela en su lugar.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response(
                {'error': f'Error al eliminar la habitación: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )