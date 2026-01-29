from rest_framework import serializers
from .models import MenuRestaurante

class MenuRestauranteSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuRestaurante
        fields = '__all__'