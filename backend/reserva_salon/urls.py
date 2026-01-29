from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReservaSalonViewSet, solicitar_codigo_salon

router = DefaultRouter()
router.register(r'reservas', ReservaSalonViewSet, basename='reserva-salon')

urlpatterns = [
    # Ruta manual para validar disponibilidad y enviar código
    path('solicitar-codigo/', solicitar_codigo_salon, name='solicitar-codigo-salon'),
    
    # Rutas automáticas del CRUD
    path('', include(router.urls)),
]