from django.contrib import admin
from .models import MenuRestaurante


@admin.register(MenuRestaurante)
class MenuRestauranteAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre')
