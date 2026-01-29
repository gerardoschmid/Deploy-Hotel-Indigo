from django.contrib import admin
from .models import AtencionCliente


@admin.register(AtencionCliente)
class AtencionClienteAdmin(admin.ModelAdmin):
    list_display = ('id', 'usuario_id', 'tipo_atencion')
