# reserva_servicio/models.py

from django.db import models
from reserva_habitacion.models import ReservaHabitacion 
from servicio_adicional.models import ServicioAdicional
from decimal import Decimal

# =========================================================
# MODELO ServicioReserva (Tabla reserva_servicio)
# =========================================================

class ServicioReserva(models.Model):
    """
    Modelo para registrar los servicios adicionales consumidos en una reserva.
    Es la tabla pivote entre ReservaHabitacion y ServicioAdicional.
    """
    
    reserva_habitacion = models.ForeignKey(
        ReservaHabitacion, 
        on_delete=models.CASCADE, 
        related_name='servicios_solicitados',
        verbose_name='Reserva Asociada'
    )
    
    servicio = models.ForeignKey(
        ServicioAdicional, 
        on_delete=models.RESTRICT, 
        related_name='reservas_asociadas',
        verbose_name='Servicio Adicional'
    )
    
    cantidad = models.PositiveSmallIntegerField(default=1, verbose_name='Cantidad')
    
    # CAMPO SOLICITADO: Para detallar servicios de tipo 'OTRO'
    notas_cliente = models.TextField(
        blank=True, 
        null=True, 
        verbose_name='Notas del Cliente (Detalle del Servicio)'
    )
    
    # Precio capturado al momento de la reserva para mantener histórico (importante)
    precio_unitario = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        verbose_name='Precio Cobrado'
    )
    
    class Meta:
        db_table = 'reserva_servicio'
        verbose_name = 'Servicio por Reserva'
        verbose_name_plural = 'Servicios por Reservas'
        # Asegura que un servicio no se añada dos veces a la misma reserva
        unique_together = ('reserva_habitacion', 'servicio')

    def __str__(self):
        return f'{self.servicio.nombre} ({self.cantidad}x) para Res. #{self.reserva_habitacion.codigo_confirmacion}'

    def save(self, *args, **kwargs):
        """Asegura que el precio unitario se capture si no se proporciona."""
        # Si el precio unitario no ha sido fijado (es decir, es una nueva creación),
        # se usa el precio actual del servicio en el catálogo.
        if not self.precio_unitario:
            self.precio_unitario = self.servicio.precio
            
        super().save(*args, **kwargs)