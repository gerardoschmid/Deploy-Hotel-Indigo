from celery import shared_task
from celery.utils.log import get_task_logger
from django.core.mail import send_mail
from .models import ReservaRestaurante
from django.conf import settings
import time

# Configuramos el logger para monitorear la tarea en la terminal de Celery
logger = get_task_logger(__name__)

@shared_task(bind=True)
def enviar_email_restaurante(self, id_reserva):
    """
    Tarea asíncrona para enviar la confirmación de reserva de mesa al cliente.
    Se ha simplificado para eliminar campos de costo no necesarios en restaurante.
    """
    logger.info(f"--- [CELERY] Iniciando email restaurante para ID: {id_reserva} ---")
    
    # Pausa de seguridad para asegurar que el registro existe en la DB tras la transacción
    time.sleep(1)
    
    try:
        # Obtenemos la reserva con select_related para optimizar la consulta a DB
        reserva = ReservaRestaurante.objects.select_related('usuario', 'mesa').get(pk=id_reserva)
        
        # Validamos si el usuario tiene un correo electrónico configurado
        email_cliente = reserva.usuario.email if (reserva.usuario and reserva.usuario.email) else None
        
        if not email_cliente:
            logger.warning(f"El usuario {reserva.usuario.username} no tiene email configurado.")
            return f"Fallo: Sin email en reserva {id_reserva}"

        # Usamos el primer nombre si está disponible, de lo contrario el username
        nombre = reserva.usuario.first_name if reserva.usuario.first_name else reserva.usuario.username
        
        asunto = f"Confirmación de Mesa #{reserva.codigo_reserva} - Hotel Indigo"
        
        # Formateamos la fecha para que sea legible (Día/Mes/Año Hora:Minutos)
        fecha_legible = reserva.fecha_reserva.strftime('%d/%m/%Y %H:%M')
        
        # Cuerpo del mensaje (Sin el campo total_reserva)
        mensaje = (
            f"Hola {nombre},\n\n"
            f"Tu mesa en el restaurante de Hotel Indigo ha sido reservada con éxito.\n\n"
            f"Detalles de la Reserva:\n"
            f"  - Código de Reserva: {reserva.codigo_reserva}\n"
            f"  - Mesa Número: {reserva.mesa.numero_mesa}\n"
            f"  - Fecha y Hora: {fecha_legible}\n"
            f"  - Comensales: {reserva.cantidad_personas}\n"
            f"  - Notas: {reserva.notas if reserva.notas else 'Ninguna'}\n\n"
            f"¡Te esperamos para disfrutar de una excelente comida!\n\n"
            f"Atentamente,\n"
            f"Equipo de Restaurante Hotel Indigo"
        )

        # Envío del correo
        send_mail(
            asunto,
            mensaje,
            settings.DEFAULT_FROM_EMAIL,
            [email_cliente],
            fail_silently=False,
        )

        logger.info(f"--- [CELERY] Email enviado a {email_cliente} para reserva {reserva.codigo_reserva} ---")
        return f"Éxito: Email de reserva {reserva.codigo_reserva} enviado."

    except ReservaRestaurante.DoesNotExist:
        logger.error(f"Error: La reserva con ID {id_reserva} no existe.")
        return f"Error: ID {id_reserva} no encontrado."
    
    except Exception as exc:
        logger.error(f"Error en tarea de restaurante: {exc}")
        # Reintento automático: espera 60 segundos, máximo 3 intentos
        raise self.retry(exc=exc, countdown=60, max_retries=3)