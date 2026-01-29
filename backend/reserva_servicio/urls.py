# reserva_servicio/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServicioReservaViewSet

router = DefaultRouter()
router.register(r'servicios', ServicioReservaViewSet, basename='servicios-reserva')

urlpatterns = [
    path('', include(router.urls)),
]