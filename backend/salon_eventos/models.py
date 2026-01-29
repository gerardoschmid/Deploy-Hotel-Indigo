from django.db import models

class SalonEvento(models.Model):
    # Opciones de Estado (Coinciden con el Frontend)
    ESTADO_DISPONIBLE = 'disponible'
    ESTADO_OCUPADO = 'ocupado'
    ESTADO_MANTENIMIENTO = 'mantenimiento'

    ESTADO_CHOICES = [
        (ESTADO_DISPONIBLE, 'Disponible'),
        (ESTADO_OCUPADO, 'Ocupado'),
        (ESTADO_MANTENIMIENTO, 'Mantenimiento'),
    ]

    id = models.AutoField(primary_key=True)
    nombre = models.TextField(null=True)
    descripcion = models.TextField(null=True)
    
    # Campo Nuevo: Estado
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default=ESTADO_DISPONIBLE,
        verbose_name='Estado de Disponibilidad'
    )

    imagen = models.ImageField(
        upload_to='salones/', 
        null=True, 
        blank=True, 
        verbose_name='Imagen del salón'
    )

    class Meta:
        db_table = 'salon_eventos'
        managed = True

    def __str__(self):
        return f"{self.nombre} ({self.get_estado_display()})"