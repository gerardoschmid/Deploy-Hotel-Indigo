from django.contrib import admin
from django.utils.html import format_html
from .models import Habitacion

@admin.register(Habitacion)
class HabitacionAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'numero_habitacion',
        'piso',
        'tipo_ocupacion',
        'tamaño_cama',
        'categoria',
        'condicion',
        'estado',
        'precio_base',
        'activa',
        'reservas_count'
    ]
    
    list_editable = [
        'estado',
        'precio_base',
        'activa'
    ]
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('numero_habitacion', 'piso', 'activa')
        }),
        ('Características', {
            'fields': ('tipo_ocupacion', 'tamaño_cama', 'categoria')
        }),
        ('Descripciones', {
            'fields': ('caracteristicas', 'descripcion'),
            'classes': ('collapse',)
        }),
        ('Estado y Precios', {
            'fields': ('estado', 'precio_base', 'condicion')
        }),
    )
    
    readonly_fields = ['condicion']
    list_filter = ['piso', 'categoria', 'estado', 'activa', 'tipo_ocupacion', 'tamaño_cama']
    search_fields = ['numero_habitacion', 'caracteristicas', 'descripcion']
    ordering = ['piso', 'numero_habitacion']
    
    def estado_badge(self, obj):
        colors = {
            'disponible': 'green',
            'ocupada': 'red',
            'limpieza': 'orange',
            'mantenimiento': 'gray'
        }
        color = colors.get(obj.estado, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_estado_display()
        )
    estado_badge.short_description = 'Estado'
    
    def reservas_count(self, obj):
        count = obj.reservas.count()
        if count > 0:
            return format_html(
                '<span style="color: blue; font-weight: bold;">{} reservas</span>',
                count
            )
        return 'Sin reservas'
    reservas_count.short_description = 'Reservas'
    
    actions = ['marcar_disponibles', 'marcar_mantenimiento', 'activar_seleccionadas', 'desactivar_seleccionadas']
    
    def marcar_disponibles(self, request, queryset):
        updated = queryset.update(estado='disponible')
        self.message_user(request, f'{updated} habitaciones marcadas como disponibles.')
    marcar_disponibles.short_description = 'Marcar como disponibles'
    
    def marcar_mantenimiento(self, request, queryset):
        updated = queryset.update(estado='mantenimiento')
        self.message_user(request, f'{updated} habitaciones enviadas a mantenimiento.')
    marcar_mantenimiento.short_description = 'Enviar a mantenimiento'
    
    def activar_seleccionadas(self, request, queryset):
        updated = queryset.update(activa=True)
        self.message_user(request, f'{updated} habitaciones activadas.')
    activar_seleccionadas.short_description = 'Activar habitaciones'
    
    def desactivar_seleccionadas(self, request, queryset):
        updated = queryset.update(activa=False)
        self.message_user(request, f'{updated} habitaciones desactivadas.')
    desactivar_seleccionadas.short_description = 'Desactivar habitaciones'