from celery import shared_task
from celery.utils.log import get_task_logger
from django.core.mail import send_mail
from .models import ReservaSalon
from django.conf import settings
import time

# Configuramos el logger para monitorear la tarea en la terminal de Celery
logger = get_task_logger(__name__)

@shared_task(bind=True)
def enviar_email_salon(self, id_reserva):
    """
    Tarea asíncrona para confirmar la reserva del salón de eventos.
    Envía un correo detallado al cliente tras la creación de la reserva.
    """
    logger.info(f"--- [CELERY] Iniciando envío de email para reserva de salón ID: {id_reserva} ---")
    
    # Pausa de seguridad para garantizar que el registro ya existe en la base de datos
    time.sleep(1)
    
    try:
        # Obtenemos la reserva cargando el usuario y el salón en una sola consulta
        reserva = ReservaSalon.objects.select_related('usuario', 'salon').get(pk=id_reserva)
        
        # Validamos si el usuario tiene un correo electrónico configurado
        email_cliente = reserva.usuario.email if (reserva.usuario and reserva.usuario.email) else None
        
        if not email_cliente:
            logger.warning(f"El usuario {reserva.usuario.username} no tiene un email configurado.")
            return f"Fallo: Sin email en reserva de salón {id_reserva}"

        # Preparamos los datos del mensaje
        nombre = reserva.usuario.first_name if reserva.usuario.first_name else reserva.usuario.username
        asunto = f"Confirmación de Reserva de Salón #{reserva.codigo_evento} - Hotel Indigo"
        
        # Formateamos la fecha para que sea legible
        fecha_legible = reserva.fecha_evento.strftime('%d/%m/%Y %H:%M')
        
        mensaje = (
            f"Hola {nombre},\n\n"
            f"Tu reserva de salón en Hotel Indigo ha sido confirmada con éxito.\n\n"
            f"Detalles del Evento:\n"
            f"  - Código de Evento: {reserva.codigo_evento}\n"
            f"  - Salón: {reserva.salon.nombre}\n"
            f"  - Fecha y Hora: {fecha_legible}\n"
            f"  - Cantidad de Invitados: {reserva.cantidad_invitados}\n"
            f"  - Total de la Reserva: ${reserva.total_reserva}\n\n"
            f"Nuestro equipo de eventos se pondrá en contacto contigo a la brevedad para los detalles logísticos.\n\n"
            f"Gracias por elegir Hotel Indigo."
        )

        # Enviamos el correo electrónico usando la configuración de settings.py
        send_mail(
            asunto, 
            mensaje, 
            settings.DEFAULT_FROM_EMAIL, 
            [email_cliente],
            fail_silently=False
        )
        
        logger.info(f"--- [CELERY] Email enviado exitosamente a {email_cliente} para reserva {reserva.codigo_evento} ---")
        return f"Éxito: Email de salón {reserva.codigo_evento} enviado."

    except ReservaSalon.DoesNotExist:
        logger.error(f"Error: La reserva de salón con ID {id_reserva} no existe.")
        return f"Error: ID {id_reserva} no encontrado."
    
    except Exception as exc:
        logger.error(f"Error al enviar email de salón: {exc}")
        # Reintento automático: espera 60 segundos antes de intentar de nuevo (máximo 3 veces)
        raise self.retry(exc=exc, countdown=60, max_retries=3)