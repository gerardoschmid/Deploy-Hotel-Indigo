from django.contrib import admin
from .models import RestauranteMesa


@admin.register(RestauranteMesa)
class RestauranteMesaAdmin(admin.ModelAdmin):
    list_display = ('id', 'numero_mesa', 'capacidad')
