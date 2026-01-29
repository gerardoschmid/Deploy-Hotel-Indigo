from rest_framework import serializers
from .models import SalonEvento

class SalonEventoSerializer(serializers.ModelSerializer):
    imagen_url = serializers.SerializerMethodField()
    
    class Meta:
        model = SalonEvento
        fields = '__all__'  # Ahora incluirá automáticamente 'estado'
        
    def get_imagen_url(self, obj):
        if obj.imagen:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.imagen.url)
            return obj.imagen.url
        return None