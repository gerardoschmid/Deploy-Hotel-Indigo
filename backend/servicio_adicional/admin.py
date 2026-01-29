# servicio_adicional/admin.py

from django.contrib import admin
from .models import ServicioAdicional

@admin.register(ServicioAdicional)
class ServicioAdicionalAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'precio', 'tipo', 'activo')
    list_filter = ('tipo', 'activo')
    search_fields = ('nombre', 'descripcion')
    list_editable = ('precio', 'activo', 'tipo')