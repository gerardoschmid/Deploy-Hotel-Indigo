from django.contrib import admin
from .models import InsumoProducto


@admin.register(InsumoProducto)
class InsumoProductoAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'stock_actual')
