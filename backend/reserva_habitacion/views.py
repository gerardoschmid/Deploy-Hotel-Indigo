import random
import os
import requests
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q 
from django.contrib.sessions.backends.db import SessionStore 
from .models import ReservaHabitacion
from .serializers import ReservaHabitacionSerializer
from usuarios.permissions import IsAdministrador, IsRecepcionista, IsOwnerOrAdmin

# --- 1. SOLICITAR CÓDIGO (Con Validación Previa) ---
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def solicitar_codigo_pre_reserva(request):
    user = request.user
    
    # --- A. VALIDACIÓN PREVIA DE DISPONIBILIDAD ---
    # Recibimos los datos que envía el frontend
    habitacion_id = request.data.get('habitacion_id')
    checkin = request.data.get('checkin')
    checkout = request.data.get('checkout')

    if habitacion_id and checkin and checkout:
        # Buscamos conflictos de fechas en reservas activas
        reservas_conflictivas = ReservaHabitacion.objects.filter(
            habitacion_id=habitacion_id,
            estado__in=['pendiente', 'confirmada', 'checkin'] # Estados que ocupan la habitación
        ).filter(
            # Lógica de solapamiento: (StartA < EndB) y (EndA > StartB)
            Q(fecha_checkin__lt=checkout) & Q(fecha_checkout__gt=checkin)
        )

        if reservas_conflictivas.exists():
            return Response(
                {"error": "Lo sentimos, esta habitación ya está reservada para las fechas seleccionadas."},
                status=status.HTTP_400_BAD_REQUEST
            )

    # --- B. GENERACIÓN DE CÓDIGO (Solo si está libre) ---
    codigo = str(random.randint(100000, 999999))
    
    request.session['reserva_otp'] = codigo
    request.session.modified = True
    request.session.save()
    
    # DEBUG Logs
    print(f"\n🚀 [SOLICITUD EMAILJS] Usuario: {user.username}")
    print(f"📧 Enviando a: {user.email}")
    print(f"📢 Código generado: {codigo}")
    
    # --- C. ENVÍO EMAILJS ---
    service_id = os.environ.get("EMAILJS_SERVICE_ID")
    template_id = os.environ.get("EMAILJS_TEMPLATE_ID")
    user_id = os.environ.get("EMAILJS_USER_ID")        # Public Key
    private_key = os.environ.get("EMAILJS_PRIVATE_KEY") # Private Key

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
            "reply_to": "no-reply@hotelindigo.com"
        }
    }
    
    headers = { "Content-Type": "application/json" }

    try:
        if not all([service_id, template_id, user_id, private_key]):
            # MODO FALLBACK SI NO HAY VARIABLES (Para desarrollo)
            print("⚠️ Faltan variables de entorno. Usando modo simulación.")
            return Response({
                'message': 'Modo simulación: Código generado.',
                'debug_code': codigo, # Solo para pruebas
                'session_key_manual': request.session.session_key 
            })

        response = requests.post(url, json=payload, headers=headers)
        
        if response.status_code == 200:
            return Response({
                'message': 'Código enviado exitosamente vía EmailJS.',
                'session_key_manual': request.session.session_key 
            })
        else:
            raise Exception(f"API Error: {response.status_code} - {response.text}")
        
    except Exception as e:
        print(f"❌ Error crítico en envío: {str(e)}")
        # Si falla el email, devolvemos el código para no bloquear al usuario (UX de emergencia)
        return Response({
            'message': 'Error de envío, usa este código de prueba.',
            'debug_code': codigo,
            'session_key_manual': request.session.session_key,
            'error_info': str(e)
        }, status=status.HTTP_200_OK)


# --- 2. VIEWSET (Verificar y Crear - Sin cambios) ---
class ReservaHabitacionViewSet(viewsets.ModelViewSet):
    queryset = ReservaHabitacion.objects.all().select_related('usuario', 'habitacion')
    serializer_class = ReservaHabitacionSerializer

    def get_queryset(self):
        user = self.request.user
        base_queryset = self.queryset.all()
        if IsAdministrador().has_permission(self.request, self) or IsRecepcionista().has_permission(self.request, self):
            return base_queryset
        if user.is_authenticated:
            return base_queryset.filter(usuario=user)
        return base_queryset.none()

    def get_permissions(self):
        if self.action in ['list', 'create']:
            self.permission_classes = [permissions.IsAuthenticated]
        else:
            self.permission_classes = [IsOwnerOrAdmin]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        codigo_ingresado = request.data.get('codigo_verificacion')
        habitacion_id = request.data.get('habitacion')
        fecha_checkin = request.data.get('fecha_checkin')
        fecha_checkout = request.data.get('fecha_checkout')
        
        codigo_real = request.session.get('reserva_otp')
        manual_key = request.data.get('session_key_manual')

        # Recuperación manual
        if not codigo_real and manual_key:
            try:
                s = SessionStore(session_key=manual_key)
                codigo_real = s.get('reserva_otp')
            except Exception as e:
                print(f"Error recuperando sesión manual: {e}")

        # Validaciones OTP
        if not codigo_real:
            return Response({"detail": "Código expirado. Solicítalo de nuevo."}, status=status.HTTP_400_BAD_REQUEST)
            
        if str(codigo_ingresado) != str(codigo_real):
            return Response({"detail": "Código incorrecto."}, status=status.HTTP_400_BAD_REQUEST)

        # Validación Final de Disponibilidad (Doble check de seguridad)
        reservas_existentes = ReservaHabitacion.objects.filter(
            habitacion_id=habitacion_id,
            estado__in=['pendiente', 'confirmada', 'checkin'],
            fecha_checkin__lt=fecha_checkout,
            fecha_checkout__gt=fecha_checkin
        )

        if reservas_existentes.exists():
            return Response({"detail": "Habitación ocupada."}, status=status.HTTP_400_BAD_REQUEST)

        # Limpieza Sesión
        try:
            del request.session['reserva_otp']
        except KeyError: pass
            
        if manual_key:
             s = SessionStore(session_key=manual_key)
             if s.exists(manual_key):
                 if 'reserva_otp' in s: del s['reserva_otp']
                 s.save()

        request.session.modified = True
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    def perform_destroy(self, instance):
        try:
            instance.delete()
        except Exception:
            instance.estado = 'cancelada'
            instance.save()