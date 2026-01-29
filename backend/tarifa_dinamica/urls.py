# tarifa_dinamica/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TarifaDinamicaViewSet

# Creamos un router para generar las URLs automáticamente
router = DefaultRouter()
router.register(r'tarifas_dinamicas', TarifaDinamicaViewSet, basename='tarifa-dinamica')

urlpatterns = [
    # Incluye las rutas generadas por el router (ej: /api/tarifas_dinamicas/)
    path('', include(router.urls)),
]