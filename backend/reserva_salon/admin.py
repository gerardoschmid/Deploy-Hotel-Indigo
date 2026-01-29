from django.contrib import admin
from .models import ReservaSalon


@admin.register(ReservaSalon)
class ReservaSalonAdmin(admin.ModelAdmin):
    list_display = ('id', 'usuario_id', 'salon_id')
