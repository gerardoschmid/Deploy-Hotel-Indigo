from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReservaRestauranteViewSet

# Creamos el router de Django Rest Framework
router = DefaultRouter()

# Registramos el ViewSet. 
# Al usar r'reservas' aquí, y habiendo incluido este archivo en el urls.py principal 
# bajo el prefijo 'api/reservas-restaurante/', la ruta final será:
# /api/reservas-restaurante/reservas/
router.register(r'reservas', ReservaRestauranteViewSet, basename='reserva-restaurante')

urlpatterns = [
    # Incluimos las rutas generadas automáticamente por el router (GET, POST, etc.)
    path('', include(router.urls)),
]