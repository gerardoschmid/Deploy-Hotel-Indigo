from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly # Recomendado
from django.db.models import Q
from .models import Plato, Alergeno
from .serializers import PlatoSerializer, PlatoListSerializer, AlergenoSerializer


class PlatoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar platos del restaurante
    """
    queryset = Plato.objects.all()
    serializer_class = PlatoSerializer
    # permission_classes = [IsAuthenticatedOrReadOnly] # Descomenta si usas autenticación

    def get_serializer_class(self):
        """Retorna el serializer apropiado según la acción"""
        if self.action == 'list':
            return PlatoListSerializer
        return PlatoSerializer
    
    def get_queryset(self):
        """
        Filtros simples por parámetros URL
        """
        queryset = Plato.objects.all()

        # --- CORRECCIÓN CRÍTICA ---
        # Si la acción es sobre un objeto específico (editar, borrar, ver detalle),
        # DEVOLVEMOS TODO sin filtrar. Esto evita el error 404 al editar un plato 
        # que está inactivo o sin stock.
        if self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            return queryset
        # ---------------------------
        
        # --- Lógica de filtrado SOLO para listas ---
        
        # 1. Filtro Activo/Inactivo
        activo_param = self.request.query_params.get('activo')
        mostrar_inactivos = self.request.query_params.get('mostrar_inactivos')

        if activo_param:
            queryset = queryset.filter(activo=activo_param.lower() == 'true')
        elif not mostrar_inactivos:
            queryset = queryset.filter(activo=True)

        # 2. Filtro Disponibilidad
        disponible_param = self.request.query_params.get('disponible')
        mostrar_no_disponibles = self.request.query_params.get('mostrar_no_disponibles')

        if disponible_param:
            queryset = queryset.filter(disponible=disponible_param.lower() == 'true')
        elif not mostrar_no_disponibles:
            queryset = queryset.filter(disponible=True)

        # 3. Resto de filtros (Categoría, Precio, Búsqueda...)
        categoria = self.request.query_params.get('categoria')
        if categoria:
            queryset = queryset.filter(categoria=categoria)
        
        precio_max = self.request.query_params.get('precio_max')
        if precio_max:
            queryset = queryset.filter(precio__lte=precio_max)
        
        precio_min = self.request.query_params.get('precio_min')
        if precio_min:
            queryset = queryset.filter(precio__gte=precio_min)
        
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(nombre__icontains=search) |
                Q(descripcion__icontains=search) |
                Q(ingredientes__icontains=search)
            )
        
        # Filtro por alérgenos
        alergenos = self.request.query_params.get('alergenos')
        if alergenos:
            alergenos_list = alergenos.split(',')
            queryset = queryset.filter(alergenos__nombre__in=alergenos_list).distinct()
        
        return queryset.order_by('categoria', 'orden', 'nombre')
    
    # ... (El resto de tus acciones personalizadas se quedan igual: por_categoria, disponibles, etc.)
    @action(detail=False, methods=['get'])
    def por_categoria(self, request):
        queryset = self.get_queryset()
        platos_por_categoria = {}
        for plato in queryset:
            categoria = plato.get_categoria_display()
            if categoria not in platos_por_categoria:
                platos_por_categoria[categoria] = []
            serializer = PlatoListSerializer(plato)
            platos_por_categoria[categoria].append(serializer.data)
        return Response({'categorias': platos_por_categoria, 'total_platos': queryset.count()})
    
    @action(detail=False, methods=['get'])
    def disponibles(self, request):
        platos = Plato.objects.filter(disponible=True, activo=True)
        serializer = self.get_serializer(platos, many=True)
        return Response({'total': platos.count(), 'platos': serializer.data})
    
    @action(detail=True, methods=['post'])
    def cambiar_disponibilidad(self, request, pk=None):
        plato = self.get_object()
        disponible = request.data.get('disponible')
        if disponible is None: return Response({'error': 'Falta valor'}, status=status.HTTP_400_BAD_REQUEST)
        plato.disponible = disponible
        plato.save()
        return Response(self.get_serializer(plato).data)

    @action(detail=False, methods=['post'])
    def actualizar_orden(self, request):
        orden_data = request.data.get('orden', [])
        if not orden_data: return Response({'error': 'Faltan datos'}, status=status.HTTP_400_BAD_REQUEST)
        ids = [i.get('id') for i in orden_data if i.get('id')]
        platos = {p.id: p for p in Plato.objects.filter(id__in=ids)}
        actualizar = []
        for item in orden_data:
            pid = item.get('id')
            if pid in platos:
                platos[pid].orden = item.get('orden')
                actualizar.append(platos[pid])
        if actualizar: Plato.objects.bulk_update(actualizar, ['orden'])
        return Response({'message': 'Orden actualizado'})


class AlergenoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Alergeno.objects.all()
    serializer_class = AlergenoSerializer
    ordering = ['nombre']