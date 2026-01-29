# tarifa_dinamica/admin.py

from django.contrib import admin
from .models import TarifaDinamica

@admin.register(TarifaDinamica)
class TarifaDinamicaAdmin(admin.ModelAdmin):
    list_display = (
        'habitacion', 
        'tipo_temporada', 
        'precio', 
        'fecha_inicio', 
        'fecha_fin', 
        'descuento'
    )
    list_filter = ('tipo_temporada', 'habitacion__categoria') # Filtrar por temporada y categoría de la habitación
    search_fields = ('habitacion__numero_habitacion', 'tipo_temporada')
    date_hierarchy = 'fecha_inicio'
    
    # Facilita la edición de la relación
    raw_id_fields = ('habitacion',)