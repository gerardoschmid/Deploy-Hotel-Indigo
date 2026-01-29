from rest_framework import serializers
from .models import MenuPlato

class MenuPlatoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuPlato
        fields = '__all__'