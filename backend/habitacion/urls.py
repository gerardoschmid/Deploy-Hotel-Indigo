from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HabitacionViewSet

# Configuración del router para las URLs de la API
# Usamos DefaultRouter para generar automáticamente las URLs CRUD
router = DefaultRouter()
router.register(r'habitaciones', HabitacionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]