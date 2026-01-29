from django.contrib import admin
from .models import MenuPlato


@admin.register(MenuPlato)
class MenuPlatoAdmin(admin.ModelAdmin):
    list_display = ('id', 'menu_id', 'plato_id')
