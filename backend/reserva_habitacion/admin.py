# reserva_habitacion/admin.py

from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Sum
from .models import ReservaHabitacion
# Importar el modelo de la relación (Tabla Pivote)
from reserva_servicio.models import ServicioReserva 

# =========================================================
# 1. DEFINICIÓN DEL INLINE (Para mostrar los Servicios)
# =========================================================

class ServicioReservaInline(admin.TabularInline):
    """
    Permite editar los Servicios Adicionales dentro de la vista de ReservaHabitacion.
    """
    model = ServicioReserva
    extra = 1 # Muestra una línea vacía extra para añadir un nuevo servicio
    # Muestra los campos importantes de la relación
    fields = ('servicio', 'cantidad', 'precio_unitario') 
    readonly_fields = ('precio_unitario',) # El precio unitario debe ser fijo al crearse
    raw_id_fields = ('servicio',) # Usa una interfaz de búsqueda para la FK

# =========================================================
# 2. REGISTRO DEL MODELO PRINCIPAL CON EL INLINE
# =========================================================

@admin.register(ReservaHabitacion)
class ReservaHabitacionAdmin(admin.ModelAdmin):
    list_display = (
        'codigo_confirmacion', 
        'usuario_info', 
        'habitacion_info', 
        'fecha_checkin', 
        'fecha_checkout', 
        'noches', 
        'huespedes',
        'estado_badge', 
        'total_formateado',
        'fecha_creacion',
        'otp_status'
    )
    
    list_filter = (
        'estado', 
        'fecha_checkin', 
        'fecha_checkout',
        'habitacion__categoria',
        'habitacion__piso',
        'otp_verificado'
    )
    
    search_fields = (
        'codigo_confirmacion', 
        'usuario__username', 
        'usuario__email',
        'habitacion__numero_habitacion'
    )
    
    readonly_fields = (
        'codigo_confirmacion', 
        'fecha_creacion', 
        'total', 
        'codigo_otp',
        'otp_expira',
        'otp_verificado'
    )
    
    raw_id_fields = ('usuario', 'habitacion')
    
    fieldsets = (
        ('Información de Reserva', {
            'fields': ('codigo_confirmacion', 'usuario', 'habitacion', 'estado')
        }),
        ('Fechas y Huéspedes', {
            'fields': ('fecha_checkin', 'fecha_checkout', 'huespedes')
        }),
        ('Verificación OTP', {
            'fields': ('codigo_otp', 'otp_expira', 'otp_verificado'),
            'classes': ('collapse',)
        }),
        ('Información Financiera', {
            'fields': ('total',),
            'classes': ('collapse',)
        }),
        ('Información de Sistema', {
            'fields': ('fecha_creacion',),
            'classes': ('collapse',)
        }),
    )
    
    # 💡 ¡LA CORRECCIÓN ESTÁ AQUÍ! Se añade el inline.
    inlines = [ServicioReservaInline]
    
    def usuario_info(self, obj):
        if obj.usuario:
            return format_html(
                '<strong>{}</strong><br><small>{}</small>',
                obj.usuario.username,
                obj.usuario.email
            )
        return 'Sin usuario'
    usuario_info.short_description = 'Cliente'
    
    def habitacion_info(self, obj):
        if obj.habitacion:
            return format_html(
                '<strong>Hab {}</strong><br><small>{} - Piso {}</small>',
                obj.habitacion.numero_habitacion,
                obj.habitacion.get_categoria_display(),
                obj.habitacion.piso
            )
        return 'Sin habitación'
    habitacion_info.short_description = 'Habitación'
    
    def noches(self, obj):
        if obj.fecha_checkin and obj.fecha_checkout:
            dias = (obj.fecha_checkout - obj.fecha_checkin).days
            return f'{dias} noche{"s" if dias != 1 else ""}'
        return '-'
    noches.short_description = 'Duración'
    
    def estado_badge(self, obj):
        colors = {
            'pendiente': 'orange',
            'confirmada': 'green',
            'cancelada': 'red',
            'completada': 'blue'
        }
        color = colors.get(obj.estado, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_estado_display()
        )
    estado_badge.short_description = 'Estado'
    
    def total_formateado(self, obj):
        # 1. Asegurarnos de que el valor sea tratado como un número (float o decimal)
        # Si obj.total es None, usamos 0
        valor = float(obj.total) if obj.total else 0.0
        
        # 2. Formatear el número primero a texto
        texto_dinero = "{:,.2f}".format(valor)
        
        # 3. Meterlo en el format_html usando {} sin el decorador de formato :.2f adentro
        return format_html(
            '<span style="color: green; font-weight: bold;">${}</span>',
            texto_dinero
        )
    total_formateado.short_description = 'Total'
    
    def otp_status(self, obj):
        if obj.otp_verificado:
            return format_html(
                '<span style="color: green;">✓ Verificado</span>'
            )
        elif obj.codigo_otp and obj.otp_expira:
            return format_html(
                '<span style="color: orange;">⏰ Pendiente</span>'
            )
        return format_html(
            '<span style="color: gray;">- Sin OTP</span>'
        )
    otp_status.short_description = 'OTP'
    
    actions = ['confirmar_reservas', 'cancelar_reservas', 'completar_reservas']
    
    def confirmar_reservas(self, request, queryset):
        updated = queryset.filter(estado='pendiente').update(estado='confirmada')
        self.message_user(request, f'{updated} reservas confirmadas.')
    confirmar_reservas.short_description = 'Confirmar reservas seleccionadas'
    
    def cancelar_reservas(self, request, queryset):
        updated = queryset.exclude(estado='cancelada').update(estado='cancelada')
        self.message_user(request, f'{updated} reservas canceladas.')
    cancelar_reservas.short_description = 'Cancelar reservas seleccionadas'
    
    def completar_reservas(self, request, queryset):
        updated = queryset.filter(estado='confirmada').update(estado='completada')
        self.message_user(request, f'{updated} reservas completadas.')
    completar_reservas.short_description = 'Completar reservas seleccionadas'