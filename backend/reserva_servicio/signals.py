# reserva_servicio/signals.py

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import ServicioReserva
from reserva_habitacion.models import ReservaHabitacion
from tarifa_dinamica.models import TarifaDinamica
from decimal import Decimal
import datetime 
from django.db import models

# =========================================================
# LÓGICA DE CÁLCULO DE TOTAL (Necesaria para recalcular total de la reserva padre)
# =========================================================

def calcular_precio_diario(habitacion, fecha):
    """ Busca la tarifa dinámica aplicable para una habitación en una fecha dada. """
    try:
        tarifa = TarifaDinamica.objects.get(
            habitacion=habitacion,
            fecha_inicio__lte=fecha,
            fecha_fin__gte=fecha
        )
        precio_final = tarifa.precio * (Decimal(1) - tarifa.descuento / Decimal(100))
        return precio_final
    except TarifaDinamica.DoesNotExist:
        return habitacion.precio_base

def recalcular_total_reserva(reserva_habitacion_pk):
    """
    Recalcula el total completo de una ReservaHabitacion.
    """
    try:
        reserva = ReservaHabitacion.objects.get(pk=reserva_habitacion_pk)
    except ReservaHabitacion.DoesNotExist:
        return # Si la reserva ya fue eliminada, no hace nada

    # 1. Calcular Total Habitación
    total_habitacion = Decimal(0)
    delta = reserva.fecha_checkout - reserva.fecha_checkin
    
    for i in range(delta.days):
        fecha_noche = reserva.fecha_checkin + datetime.timedelta(days=i)
        precio_noche = calcular_precio_diario(reserva.habitacion, fecha_noche)
        total_habitacion += precio_noche

    # 2. Calcular Total Servicios
    total_servicios = reserva.servicios_solicitados.aggregate(
        costo=models.Sum(models.F('cantidad') * models.F('precio_unitario'))
    )['costo'] or Decimal(0)

    # 3. Actualizar Total y Guardar
    nuevo_total = total_habitacion + total_servicios
    
    # Usamos update para evitar la llamada recursiva a save()
    ReservaHabitacion.objects.filter(pk=reserva.pk).update(total=nuevo_total)


@receiver(post_save, sender=ServicioReserva)
@receiver(post_delete, sender=ServicioReserva)
def actualizar_total_reserva_signal(sender, instance, **kwargs):
    """
    Se dispara al guardar o eliminar un ServicioReserva.
    """
    # Llama a la función de recálculo con el PK de la reserva padre
    recalcular_total_reserva(instance.reserva_habitacion.pk)