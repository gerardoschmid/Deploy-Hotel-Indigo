# reserva_habitacion/models.py

from django.db import models
from django.contrib.auth.models import User 
from habitacion.models import Habitacion
from decimal import Decimal
import uuid 
import random
import string
from django.utils import timezone
from datetime import timedelta

class ReservaHabitacion(models.Model):
    # ESTADOS DE RESERVA
    ESTADO_PENDIENTE = 'pendiente'
    ESTADO_CONFIRMADA = 'confirmada'
    ESTADO_CANCELADA = 'cancelada'
    ESTADO_COMPLETADA = 'completada'

    ESTADO_CHOICES = [
        (ESTADO_PENDIENTE, 'Pendiente de Confirmación'),
        (ESTADO_CONFIRMADA, 'Confirmada'),
        (ESTADO_CANCELADA, 'Cancelada'),
        (ESTADO_COMPLETADA, 'Completada (Check-Out)'),
    ]

    usuario = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='reservas_habitacion',
        verbose_name='Cliente',
        null=True,
        blank=True
    )
    
    habitacion = models.ForeignKey(
        Habitacion, 
        on_delete=models.RESTRICT,
        related_name='reservas',
        verbose_name='Habitación Reservada',
        null=True,
        blank=True
    )
    
    fecha_checkin = models.DateField(verbose_name='Fecha Check-In', null=True, blank=True)
    fecha_checkout = models.DateField(verbose_name='Fecha Check-Out', null=True, blank=True)
    huespedes = models.PositiveSmallIntegerField(default=1, verbose_name='Número de Huéspedes')
    
    estado = models.CharField(
        max_length=20, 
        choices=ESTADO_CHOICES,
        default=ESTADO_PENDIENTE,
        verbose_name='Estado de la Reserva'
    )
    codigo_confirmacion = models.CharField(
        max_length=50, 
        unique=True, 
        blank=True,
        verbose_name='Código de Confirmación'
    )
    
    # NUEVOS CAMPOS PARA OTP
    codigo_otp = models.CharField(
        max_length=6,
        blank=True,
        verbose_name='Código OTP'
    )
    otp_expira = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Expiración del OTP'
    )
    otp_verificado = models.BooleanField(
        default=False,
        verbose_name='OTP Verificado'
    )
    
    total = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0.00,
        verbose_name='Total de la Reserva'
    )
    
    fecha_creacion = models.DateTimeField(
        auto_now_add=True, 
        verbose_name='Fecha de Creación',
        null=True,
        blank=True
    )

    class Meta:
        db_table = 'reserva_habitacion'
        verbose_name = 'Reserva de Habitación'
        verbose_name_plural = 'Reservas de Habitaciones'
        ordering = ['-fecha_creacion']
        
    def __str__(self):
        usuario_str = self.usuario.username if self.usuario else "Sin Usuario"
        return f'Reserva #{self.codigo_confirmacion} - {usuario_str}'

    def generar_otp(self):
        """Genera un código OTP de 6 dígitos y establece su expiración"""
        self.codigo_otp = ''.join(random.choices(string.digits, k=6))
        self.otp_expira = timezone.now() + timedelta(minutes=10)  # Expira en 10 minutos
        self.otp_verificado = False
        self.save()
        return self.codigo_otp
    
    def verificar_otp(self, codigo_ingresado):
        """Verifica si el código OTP es válido y no ha expirado"""
        if not self.codigo_otp or not self.otp_expira:
            return False
        
        if timezone.now() > self.otp_expira:
            return False
        
        if self.codigo_otp == codigo_ingresado:
            self.otp_verificado = True
            self.estado = self.ESTADO_CONFIRMADA
            self.save()
            return True
        
        return False

    def save(self, *args, **kwargs):
        """
        Calcula automáticamente el código de confirmación y el total de la estancia.
        """
        # 1. Generar código de confirmación único
        if not self.codigo_confirmacion:
            self.codigo_confirmacion = str(uuid.uuid4()).split('-')[0].upper()

        # 2. Lógica de cálculo del total
        if self.fecha_checkin and self.fecha_checkout and self.habitacion:
            diferencia = self.fecha_checkout - self.fecha_checkin
            dias = diferencia.days
            
            if dias > 0:
                # Obtención del precio_base desde el modelo Habitacion
                precio_noche = getattr(self.habitacion, 'precio_base', Decimal('0.00'))
                
                if precio_noche is None:
                    precio_noche = Decimal('0.00')
                
                # Cálculo final: Precio x Noches
                self.total = Decimal(str(precio_noche)) * Decimal(dias)
            else:
                self.total = Decimal('0.00')

        super(ReservaHabitacion, self).save(*args, **kwargs)