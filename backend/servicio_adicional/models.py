# servicio_adicional/models.py

from django.db import models
from decimal import Decimal

# =========================================================
# MODELO ServicioAdicional (Tabla servicio_adicional)
# =========================================================

class ServicioAdicional(models.Model):
    
# Definición de Constantes de Tipos
    TIPO_DESAYUNO = 'desayuno'
    TIPO_TRASLADO = 'traslado'
    TIPO_SPA = 'spa'
    TIPO_MASCOTA = 'mascota'
    TIPO_OTRO = 'otro' 
    
    TIPO_CHOICES = [
        (TIPO_DESAYUNO, 'Desayuno'),
        (TIPO_TRASLADO, 'Traslado'),
        (TIPO_SPA, 'Servicio SPA'),
        (TIPO_MASCOTA, 'Mascota (Pet-Friendly)'),
        (TIPO_OTRO, 'Otro (Servicio Personalizado)'), 
    ]
    
    # Campos del modelo
    nombre = models.CharField(
        max_length=100, 
        unique=True, 
        verbose_name='Nombre del Servicio'
    )
    
    # Campo 'tipo' con las opciones definidas
    tipo = models.CharField(
        max_length=20,
        choices=TIPO_CHOICES,
        default=TIPO_DESAYUNO,
        verbose_name='Tipo de Servicio'
    )
    
    descripcion = models.TextField(blank=True, null=True, verbose_name='Descripción Detallada')
    precio = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Precio Base')
    activo = models.BooleanField(default=True, verbose_name='Servicio Activo')
    
    class Meta:
        db_table = 'servicio_adicional'
        verbose_name = 'Servicio Adicional'
        verbose_name_plural = 'Servicios Adicionales'
        ordering = ['tipo', 'nombre']

    def __str__(self):
        return f'{self.nombre} ({self.get_tipo_display()})'