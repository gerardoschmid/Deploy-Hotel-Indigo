# habitacion/serializers.py
from rest_framework import serializers
from .models import Habitacion, ImagenHabitacion

class ImagenHabitacionSerializer(serializers.ModelSerializer):
    """
    Serializer para las imágenes adicionales (si las usas en el futuro).
    """
    class Meta:
        model = ImagenHabitacion
        fields = ['id', 'imagen', 'url_imagen', 'orden', 'activa', 'habitacion']


class HabitacionSerializer(serializers.ModelSerializer):
    """
    Serializer principal para Habitacion.
    Al usar fields = '__all__', incluye automáticamente el campo 'imagen'
    que usaremos para la subida directa.
    """
    
    # Este campo es calculado (read_only) para listar todas las urls (principal + extras)
    imagenes = serializers.SerializerMethodField()
    
    class Meta:
        model = Habitacion
        fields = '__all__'
    
    def get_imagenes(self, obj):
        """
        Retorna la lista completa de URLs de imágenes 
        (La principal 'imagen' + las extras de la tabla relacionada)
        """
        if hasattr(obj, 'get_imagenes_urls'):
            return obj.get_imagenes_urls()
        return []