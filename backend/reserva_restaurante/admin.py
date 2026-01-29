from django.contrib import admin
from .models import ReservaRestaurante


@admin.register(ReservaRestaurante)
class ReservaRestauranteAdmin(admin.ModelAdmin):
    list_display = ('id', 'usuario_id', 'mesa_id')
