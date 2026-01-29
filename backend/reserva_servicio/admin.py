# reserva_servicio/admin.py - CORREGIDO

from django.contrib import admin
from .models import ServicioReserva # <-- Nombre de modelo CORREGIDO

@admin.register(ServicioReserva) # <-- Nombre de modelo CORREGIDO
class ServicioReservaAdmin(admin.ModelAdmin):
    list_display = ('id', 'reserva_habitacion', 'servicio', 'cantidad') # Añadimos campos que son más descriptivos en el admin
    raw_id_fields = ('reserva_habitacion', 'servicio') # Útil para Foreign Keys