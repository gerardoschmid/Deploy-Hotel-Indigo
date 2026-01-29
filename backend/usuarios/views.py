import random
import os
import requests
from rest_framework import viewsets, generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.models import User
from django.db.models import Sum, Q, Count
from django.utils import timezone
from datetime import timedelta
from django.contrib.sessions.backends.db import SessionStore

from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Perfil 
from .serializers import (
    MyTokenObtainPairSerializer, 
    RegistroUsuarioSerializer, 
    UsuarioAdminSerializer,
    PerfilSerializer
)

# --- IMPORTS DE MODELOS DE OTRAS APPS ---
from reserva_habitacion.models import ReservaHabitacion
from reserva_restaurante.models import ReservaRestaurante
from reserva_salon.models import ReservaSalon
from habitacion.models import Habitacion

# --- Vistas de Autenticación ---
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class RegisterUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegistroUsuarioSerializer
    permission_classes = [AllowAny]

# --- Vistas Restauradas (ViewSets) ---
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().annotate(total_reservas=Count('reservas_habitacion'))
    serializer_class = UsuarioAdminSerializer
    permission_classes = [IsAuthenticated]

class PerfilViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        try:
            perfil = request.user.perfil
            serializer = PerfilSerializer(perfil)
            return Response(serializer.data)
        except Perfil.DoesNotExist:
            return Response({
                "username": request.user.username,
                "email": request.user.email,
                "rol": "ADMIN" if request.user.is_staff else "SIN_PERFIL"
            })

# --- DASHBOARD STATS ---
class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        today = now.date() 
        total_usuarios = User.objects.filter(is_superuser=False).count()

        activas_hab = ReservaHabitacion.objects.filter(estado__in=['pendiente', 'confirmada']).count()
        activas_mesa = ReservaRestaurante.objects.filter(estado__in=['pendiente', 'confirmada']).count()
        activas_salon = ReservaSalon.objects.filter(estado__in=['pendiente', 'confirmada']).count()
        total_reservas_activas = activas_hab + activas_mesa + activas_salon

        ocupadas_hoy = ReservaHabitacion.objects.filter(
            Q(estado='confirmada') | Q(estado='completada'),
            fecha_checkin__lte=today,
            fecha_checkout__gt=today
        ).count()
        
        try:
            total_habitaciones = Habitacion.objects.count()
        except:
            total_habitaciones = 20

        ingresos_hab = ReservaHabitacion.objects.filter(
            estado__in=['confirmada', 'completada']
        ).aggregate(total=Sum('total'))['total'] or 0

        ingresos_salon = ReservaSalon.objects.filter(
            estado__in=['confirmada']
        ).aggregate(total=Sum('total_reserva'))['total'] or 0
        
        ingresos_rest = ReservaRestaurante.objects.filter(
             estado__in=['confirmada']
        ).aggregate(total=Sum('total_reserva'))['total'] or 0

        total_ingresos = ingresos_hab + ingresos_salon + ingresos_rest

        semana_data = [0] * 7 
        fecha_inicio_semana = today - timedelta(days=6)

        def procesar_fechas(queryset, campo_fecha):
            for res in queryset:
                fecha = getattr(res, campo_fecha)
                if isinstance(fecha, timezone.datetime):
                    fecha = fecha.date()
                if fecha >= fecha_inicio_semana and fecha <= today:
                    dia_semana = fecha.weekday()
                    semana_data[dia_semana] += 1

        res_hab = ReservaHabitacion.objects.filter(fecha_checkin__gte=fecha_inicio_semana)
        res_mesa = ReservaRestaurante.objects.filter(fecha_reserva__gte=fecha_inicio_semana)
        res_salon = ReservaSalon.objects.filter(fecha_evento__gte=fecha_inicio_semana)

        procesar_fechas(res_hab, 'fecha_checkin')
        procesar_fechas(res_mesa, 'fecha_reserva')
        procesar_fechas(res_salon, 'fecha_evento')

        data = {
            "usuarios": total_usuarios,
            "reservasActivas": total_reservas_activas,
            "habitacionesOcupadas": ocupadas_hoy,
            "totalHabitaciones": total_habitaciones,
            "ingresos": total_ingresos,
            "ocupacionSemanal": semana_data
        }
        return Response(data)

# =========================================================
# LÓGICA DE RECUPERACIÓN DE CONTRASEÑA (OTP + EMAILJS)
# =========================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def solicitar_recuperacion_password(request):
    email = request.data.get('email')
    
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "No existe un usuario con este correo electrónico."}, status=status.HTTP_404_NOT_FOUND)

    # 1. Generar código de 6 dígitos
    codigo = str(random.randint(100000, 999999))
    
    # 2. Guardar en sesión (Igual que en reservas de habitaciones)
    request.session['reset_password_otp'] = codigo
    request.session['reset_password_user_id'] = user.id
    request.session.modified = True
    request.session.save()

    # 3. Parámetros de EmailJS (Leídos de variables de entorno)
    service_id = os.environ.get("EMAILJS_SERVICE_ID")
    template_id = os.environ.get("EMAILJS_TEMPLATE_ID")
    user_id = os.environ.get("EMAILJS_USER_ID")
    private_key = os.environ.get("EMAILJS_PRIVATE_KEY")

    payload = {
        "service_id": service_id,
        "template_id": template_id,
        "user_id": user_id,
        "accessToken": private_key,
        "template_params": {
            "to_name": user.first_name or user.username,
            "to_email": user.email,
            "message": f"Tu código de recuperación es: {codigo}",
            "reply_to": "no-reply@hotelindigo.com"
        }
    }

    try:
        # Modo Debug si no hay variables configuradas en local
        if not all([service_id, template_id, user_id, private_key]):
            return Response({
                'message': 'Modo simulación activado.',
                'debug_code': codigo,
                'session_key_manual': request.session.session_key
            })

        response = requests.post("https://api.emailjs.com/api/v1.0/email/send", json=payload)
        
        if response.status_code == 200:
            return Response({
                'message': 'Código enviado exitosamente.',
                'session_key_manual': request.session.session_key 
            })
        else:
            raise Exception(f"EmailJS Error: {response.text}")
            
    except Exception as e:
        return Response({
            'message': 'Error al enviar email, usa el código de prueba.',
            'debug_code': codigo,
            'session_key_manual': request.session.session_key,
            'error_detail': str(e)
        }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def confirmar_recuperacion_password(request):
    codigo_ingresado = request.data.get('code')
    nueva_password = request.data.get('new_password')
    manual_key = request.data.get('session_key_manual')

    # Recuperar sesión manualmente del Store (Vital para producción/Railway)
    s = SessionStore(session_key=manual_key)
    codigo_real = s.get('reset_password_otp')
    user_id = s.get('reset_password_user_id')

    if not codigo_real or str(codigo_ingresado) != str(codigo_real):
        return Response({"detail": "Código incorrecto o expirado."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(id=user_id)
        user.set_password(nueva_password)
        user.save()
        
        # Limpieza de sesión
        if 'reset_password_otp' in s: del s['reset_password_otp']
        if 'reset_password_user_id' in s: del s['reset_password_user_id']
        s.save()

        return Response({"message": "Contraseña actualizada correctamente."})
    except Exception as e:
        return Response({"error": "Error al actualizar la contraseña."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)