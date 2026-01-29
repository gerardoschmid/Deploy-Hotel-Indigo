from rest_framework import serializers
from .models import RestauranteMesa  # <--- Fíjate que importamos el modelo de la MESA

class RestauranteMesaSerializer(serializers.ModelSerializer):
    # Campo extra para devolver la URL completa de la imagen al frontend
    imagen_url = serializers.SerializerMethodField()

    class Meta:
        model = RestauranteMesa
        fields = ['id', 'numero_mesa', 'capacidad', 'imagen', 'imagen_url']

    def get_imagen_url(self, obj):
        request = self.context.get('request')
        if obj.imagen:
            return request.build_absolute_uri(obj.imagen.url) if request else obj.imagen.url
        return None