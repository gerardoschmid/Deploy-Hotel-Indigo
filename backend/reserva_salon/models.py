from django.db import models
from django.contrib.auth.models import User
# Se corrige la importación para que coincida exactamente con salon_eventos/models.py
from salon_eventos.models import SalonEvento
from decimal import Decimal
import uuid

class ReservaSalon(models.Model):
    # ESTADOS DE LA RESERVA
    ESTADO_PENDIENTE = 'pendiente'
    ESTADO_CONFIRMADA = 'confirmada'
    ESTADO_CANCELADA = 'cancelada'

    ESTADO_CHOICES = [
        (ESTADO_PENDIENTE, 'Pendiente'),
        (ESTADO_CONFIRMADA, 'Confirmada'),
        (ESTADO_CANCELADA, 'Cancelada'),
    ]

    usuario = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='reservas_salon',
        verbose_name='Cliente'
    )
    
    # Se utiliza SalonEvento (singular) según la definición del maestro
    salon = models.ForeignKey(
        SalonEvento, 
        on_delete=models.CASCADE, 
        related_name='reservas',
        verbose_name='Salón de Evento'
    )
    
    fecha_evento = models.DateTimeField(verbose_name='Fecha y Hora del Evento')
    cantidad_invitados = models.PositiveIntegerField(verbose_name='Número de Invitados')
    
    # Código único generado automáticamente para el email transaccional
    codigo_evento = models.CharField(
        max_length=15, 
        unique=True, 
        blank=True, 
        verbose_name='Código de Evento'
    )
    
    estado = models.CharField(
        max_length=20, 
        choices=ESTADO_CHOICES, 
        default=ESTADO_PENDIENTE,
        verbose_name='Estado'
    )
    
    total_reserva = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0.00,
        verbose_name='Total'
    )
    
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reserva_salon'
        verbose_name = 'Reserva de Salón'
        verbose_name_plural = 'Reservas de Salones'
        ordering = ['-fecha_evento']

    def save(self, *args, **kwargs):
        """
        Sobrescribe el método save para generar el código único del evento.
        """
        # 1. Generación de código único (Ej: EVT-A1B2C3)
        if not self.codigo_evento:
            self.codigo_evento = f"EVT-{str(uuid.uuid4()).split('-')[0][:6].upper()}"

        # 2. Lógica de cálculo (Opcional: se puede extender si el salón tiene precio base)
        # if not self.total_reserva and self.salon:
        #     self.total_reserva = getattr(self.salon, 'precio_base', 0.00)

        super(ReservaSalon, self).save(*args, **kwargs)

    def __str__(self):
        usuario_str = self.usuario.username if self.usuario else "Sin Usuario"
        return f"{self.codigo_evento} - {usuario_str} ({self.fecha_evento})"