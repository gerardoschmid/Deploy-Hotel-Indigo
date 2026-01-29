from django.db import models
from django.contrib.auth.models import User
from restaurante_mesa.models import RestauranteMesa
from decimal import Decimal
import uuid

class ReservaRestaurante(models.Model):
    # ESTADOS DA RESERVA (Opcional pero recomendado para o email)
    ESTADO_PENDIENTE = 'pendiente'
    ESTADO_CONFIRMADA = 'confirmada'
    ESTADO_CANCELADA = 'cancelada'

    ESTADO_CHOICES = [
        (ESTADO_PENDIENTE, 'Pendente'),
        (ESTADO_CONFIRMADA, 'Confirmada'),
        (ESTADO_CANCELADA, 'Cancelada'),
    ]

    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reservas_restaurante')
    mesa = models.ForeignKey(RestauranteMesa, on_delete=models.CASCADE, related_name='reservas')
    fecha_reserva = models.DateTimeField(verbose_name='Data e Hora da Reserva')
    cantidad_personas = models.PositiveIntegerField(verbose_name='Número de Comensais')
    
    # Campo para o email transaccional
    codigo_reserva = models.CharField(max_length=15, unique=True, blank=True, verbose_name='Código de Reserva')
    
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default=ESTADO_PENDIENTE)
    notas = models.TextField(blank=True, null=True, verbose_name='Notas Especiais')
    
    # Campo para posibles custos de reserva (ex: depósitos)
    total_reserva = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reserva_restaurante'
        verbose_name = 'Reserva de Restaurante'
        verbose_name_plural = 'Reservas de Restaurante'
        ordering = ['-fecha_reserva']

    def save(self, *args, **kwargs):
        """
        Sobrescribimos save para xerar o código e calcular custos antes de gardar.
        """
        # 1. Xeración de código único se non existe
        if not self.codigo_reserva:
            # Usamos un prefixo 'RES-' seguido de 6 caracteres únicos
            self.codigo_reserva = f"RES-{str(uuid.uuid4()).split('-')[0][:6].upper()}"

        # 2. Lóxica de cálculo (Plan B se a mesa ten custo de reserva)
        # Se a túa mesa tivese un campo 'costo_reserva', poderiamos usalo aquí:
        # costo_base = getattr(self.mesa, 'costo_reserva', Decimal('0.00'))
        # self.total_reserva = costo_base

        super(ReservaRestaurante, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.codigo_reserva} - {self.usuario.username} ({self.fecha_reserva})"