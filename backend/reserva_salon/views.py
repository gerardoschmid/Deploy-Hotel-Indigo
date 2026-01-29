import random
import os
import requests
import logging
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.sessions.backends.db import SessionStore
from .models import ReservaSalon
from .serializers import ReservaSalonSerializer
from .task import enviar_email_salon

logger = logging.getLogger(__name__)

# --- PARTE 1: SOLICITAR CÓDIGO (Validación + OTP) ---
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def solicitar_codigo_salon(request):
    user = request.user
    data = request.data
    
    # 1. Validar Disponibilidad
    salon_id = data.get('salon_id')
    fecha_evento = data.get('fecha_evento') # Formato "YYYY-MM-DDTHH:MM"

    if salon_id and fecha_evento:
        # Verifica si ya existe una reserva en esa fecha exacta
        ocupado = ReservaSalon.objects.filter(
            salon_id=salon_id,
            fecha_evento=fecha_evento,
            estado__in=['pendiente', 'confirmada']
        ).exists()

        if ocupado:
            return Response(
                {"error": "El salón ya está reservado para esa fecha y hora."},
                status=status.HTTP_400_BAD_REQUEST
            )

    # 2. Generar Código OTP
    codigo = str(random.randint(100000, 999999))
    
    # Guardar en sesión
    request.session['reserva_salon_otp'] = codigo
    request.session.save()
    
    print(f"DEBUG: Código Salón para {user.username}: {codigo}")

    # 3. Enviar Email (Lógica EmailJS)
    try:
        service_id = os.environ.get("EMAILJS_SERVICE_ID")
        template_id = os.environ.get("EMAILJS_TEMPLATE_ID")
        user_id = os.environ.get("EMAILJS_USER_ID")
        private_key = os.environ.get("EMAILJS_PRIVATE_KEY")

        if all([service_id, template_id, user_id, private_key]):
            url = "https://api.emailjs.com/api/v1.0/email/send"
            payload = {
                "service_id": service_id,
                "template_id": template_id,
                "user_id": user_id,
                "accessToken": private_key,
                "template_params": {
                    "to_name": user.first_name,
                    "to_email": user.email,
                    "message": codigo,
                    "reply_to": "eventos@hotel.com"
                }
            }
            requests.post(url, json=payload, headers={"Content-Type": "application/json"})

        return Response({
            'message': 'Código enviado.',
            'session_key_manual': request.session.session_key 
        })
    except Exception as e:
        logger.error(f"Error enviando OTP: {e}")
        return Response({'message': 'Código generado.', 'session_key_manual': request.session.session_key})


# --- PARTE 2: CREAR RESERVA (Validación OTP + FILTRO DE SEGURIDAD) ---
class ReservaSalonViewSet(viewsets.ModelViewSet):
    serializer_class = ReservaSalonSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        FILTRO DE SEGURIDAD: 
        - Admin y Recepcionista ven todas las reservas.
        - Clientes solo ven las suyas.
        """
        user = self.request.user
        
        # Verificación por Staff o por Rol en Perfil
        if user.is_staff or (hasattr(user, 'perfil') and user.perfil.rol in ['ADMINISTRADOR', 'RECEPCIONISTA']):
            return ReservaSalon.objects.all().select_related('usuario', 'salon')
            
        return ReservaSalon.objects.filter(usuario=user).select_related('usuario', 'salon')

    def create(self, request, *args, **kwargs):
        # 1. Validar que el código enviado coincida con la sesión
        codigo_ingresado = request.data.get('codigo_verificacion')
        manual_key = request.data.get('session_key_manual')
        
        # Recuperar código real de la sesión
        codigo_real = request.session.get('reserva_salon_otp')
        
        # Intento de recuperación manual si la cookie falló
        if not codigo_real and manual_key:
            try:
                s = SessionStore(session_key=manual_key)
                codigo_real = s.get('reserva_salon_otp')
            except: pass

        # Si se envió código, debe coincidir
        if codigo_ingresado:
            if not codigo_real or str(codigo_ingresado) != str(codigo_real):
                return Response(
                    {"detail": "Código de verificación incorrecto o expirado."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        # Guardar la reserva asignando el usuario actual
        instance = serializer.save(usuario=self.request.user)
        
        # Limpiar OTP de sesión
        try:
            if 'reserva_salon_otp' in self.request.session:
                del self.request.session['reserva_salon_otp']
        except: pass

        # Enviar correo de confirmación (Celery)
        try:
            print(f"DEBUG: Reserva Salón creada. Enviando a Celery...")
            enviar_email_salon.delay(instance.pk)
        except Exception as e:
            logger.error(f"Error Celery: {e}")