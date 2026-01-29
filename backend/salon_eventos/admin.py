from django.contrib import admin
from .models import SalonEvento


@admin.register(SalonEvento)
class SalonEventoAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'descripcion')
