# servicio_adicional/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServicioAdicionalViewSet

router = DefaultRouter()
# Define la URL principal para acceder a la lista: /api/servicio_adicional/servicios/
router.register(r'servicios', ServicioAdicionalViewSet, basename='servicio-adicional')

urlpatterns = [
    path('', include(router.urls)),
]