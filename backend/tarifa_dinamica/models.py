# tarifa_dinamica/models.py

from django.db import models
from habitacion.models import Habitacion # ¡Importamos el modelo Habitacion existente!

class TarifaDinamica(models.Model):
    """
    Modelo para gestionar tarifas dinámicas (por temporada, eventos, etc.)
    relacionadas con una habitación específica.
    """
    
    # Opciones para el tipo de temporada
    TEMPORADA_ALTA = 'alta'
    TEMPORADA_MEDIA = 'media'
    TEMPORADA_BAJA = 'baja'
    TEMPORADA_EVENTO = 'evento'
    
    TIPO_TEMPORADA_CHOICES = [
        (TEMPORADA_ALTA, 'Temporada Alta'),
        (TEMPORADA_MEDIA, 'Temporada Media'),
        (TEMPORADA_BAJA, 'Temporada Baja'),
        (TEMPORADA_EVENTO, 'Evento Especial'),
    ]
    
    # Relación uno a muchos con el modelo Habitacion
    habitacion = models.ForeignKey(
        Habitacion, 
        on_delete=models.CASCADE, 
        related_name='tarifas_dinamicas',
        verbose_name='Habitación'
    )
    
    tipo_temporada = models.CharField(
        max_length=20, 
        choices=TIPO_TEMPORADA_CHOICES,
        default=TEMPORADA_MEDIA,
        verbose_name='Tipo de Temporada'
    )
    
    # Precio de la tarifa durante esta temporada
    precio = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=200.00, # Valor por defecto para evitar error en migración
        verbose_name='Precio Base de la Temporada'
    ) 
    
    fecha_inicio = models.DateField(verbose_name='Fecha de Inicio')
    
    fecha_fin = models.DateField(verbose_name='Fecha de Fin')
    
    # Descuento opcional aplicado a esta tarifa (0.0 por defecto)
    descuento = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0.00,
        verbose_name='Descuento (%)'
    )
    
    class Meta:
        db_table = 'tarifa_dinamica'
        verbose_name = 'Tarifa Dinámica'
        verbose_name_plural = 'Tarifas Dinámicas'
        # Evitar dos tarifas dinámicas para la misma habitación en el mismo rango de fechas
        # constraints = [
        #     models.UniqueConstraint(fields=['habitacion', 'fecha_inicio', 'fecha_fin'], name='unique_tarifa_rango')
        # ]
        ordering = ['habitacion__numero_habitacion', 'fecha_inicio']

    def __str__(self):
        return f'{self.habitacion.numero_habitacion} - {self.get_tipo_temporada_display()} ({self.fecha_inicio} a {self.fecha_fin})'