from rest_framework import serializers
from .models import Plato, Alergeno


class AlergenoSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Alergeno.
    """
    
    class Meta:
        model = Alergeno
        fields = ['id', 'nombre', 'descripcion', 'icono']


class PlatoSerializer(serializers.ModelSerializer):
    """
    Serializer completo para operaciones CRUD (Create, Retrieve, Update, Destroy).
    """
    
    url_imagen_completa = serializers.SerializerMethodField()
    lista_ingredientes = serializers.SerializerMethodField()
    alergenos_detalle = AlergenoSerializer(many=True, read_only=True)
    categoria_display = serializers.CharField(source='get_categoria_display', read_only=True)
    
    class Meta:
        model = Plato
        fields = '__all__'
    
    def get_url_imagen_completa(self, obj):
        return obj.get_url_imagen()
    
    def get_lista_ingredientes(self, obj):
        return obj.get_lista_ingredientes()


class PlatoListSerializer(serializers.ModelSerializer):
    """
    Serializer para la lista de platos.
    IMPRESCINDIBLE: Debe incluir todos los campos que se usan en la tabla
    y en el formulario de edición rápida del Frontend.
    """
    
    url_imagen_completa = serializers.SerializerMethodField()
    categoria_display = serializers.CharField(source='get_categoria_display', read_only=True)
    
    # Agregamos lista_ingredientes y alergenos para filtros visuales rápidos si se necesitan
    lista_ingredientes = serializers.SerializerMethodField()
    alergenos_detalle = AlergenoSerializer(many=True, read_only=True)
    
    class Meta:
        model = Plato
        fields = [
            'id', 
            'nombre', 
            'precio', 
            'categoria', 
            'categoria_display',
            'disponible', 
            'activo', 
            'orden', 
            'url_imagen_completa',
            # --- CAMPOS AGREGADOS PARA EL ADMIN ---
            'descripcion',   # Necesario para la tabla y el modal de editar
            'ingredientes',  # Necesario para el buscador y editar
            'imagen',        # Necesario para detectar si hay imagen subida al editar
            'url_imagen',    # Necesario para editar URLs externas
            'lista_ingredientes', # Útil para mostrar tags en la UI
            'alergenos_detalle'   # Útil para mostrar iconos de alérgenos
        ]
    
    def get_url_imagen_completa(self, obj):
        return obj.get_url_imagen()

    def get_lista_ingredientes(self, obj):
        return obj.get_lista_ingredientes()