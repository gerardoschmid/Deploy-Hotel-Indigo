from django.urls import path, include
from rest_framework.routers import DefaultRouter
# IMPORTANTE: Agregamos 'solicitar_codigo_pre_reserva' a la importación
from .views import ReservaHabitacionViewSet, solicitar_codigo_pre_reserva
from .web_views import (
    ReservaWebView, VerificarOTPView, ReenviarOTPView, reserva_exitosa,
    api_crear_reserva, api_verificar_otp, api_reenviar_otp
)

# Creamos el router de Django Rest Framework
router = DefaultRouter()

# Registramos el ViewSet directamente
router.register(r'', ReservaHabitacionViewSet, basename='reserva-habitacion')

urlpatterns = [
    # --- RUTA NUEVA ---
    # Esta es la que llama el Frontend. Al estar dentro de este archivo,
    # la URL final será: /api/reservas-habitacion/solicitar-codigo/
    path('solicitar-codigo/', solicitar_codigo_pre_reserva, name='solicitar-codigo'),

    # Incluimos las rutas generadas automáticamente por el router (create, list, etc.)
    path('', include(router.urls)),
    
    # Vistas web (mantener para compatibilidad)
    path('reservar/', ReservaWebView.as_view(), name='reserva_habitacion'),
    path('verificar-otp/', VerificarOTPView.as_view(), name='verificar_otp'),
    path('reenviar-otp/', ReenviarOTPView.as_view(), name='reenviar_otp'),
    path('reserva-exitosa/', reserva_exitosa, name='reserva_exitosa'),
    
    # API endpoints para JavaScript (mantener para compatibilidad)
    path('api/crear-reserva/', api_crear_reserva, name='api_crear_reserva'),
    path('api/verificar-otp/<int:reserva_id>/', api_verificar_otp, name='api_verificar_otp'),
    path('api/reenviar-otp/<int:reserva_id>/', api_reenviar_otp, name='api_reenviar_otp'),
]