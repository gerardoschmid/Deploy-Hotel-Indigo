# proyectohotel-backend/backend/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from usuarios.views import RegisterUserView, MyTokenObtainPairView

urlpatterns = [
    # Ruta del Panel de Administración de Django
    path('admin/', admin.site.urls),
    path('api/auth/register/', RegisterUserView.as_view(), name='register'),
    
    # 1. Endpoint de LOGIN personalizado
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token', MyTokenObtainPairView.as_view()), # Versión sin barra
    
    # 2. Endpoint de REFRESH
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/refresh', TokenRefreshView.as_view()), # Versión sin barra

    
    # ------------------------------------------------------------------
    # RUTAS DE LAS APPS LOCALES
    # ------------------------------------------------------------------
    
    # Ruta de  app de usuarios (donde irá el Registro US-001 y gestión de perfiles)
    path('api/usuarios/', include('usuarios.urls')), 
    
    # otras rutas existentes:
    path('api/habitaciones/', include('habitacion.urls')),
    path('api/reservas-habitacion/', include('reserva_habitacion.urls')),
    path('api/atencion-cliente/', include('atencion_cliente.urls')),
    path('api/servicios-adicionales/', include('servicio_adicional.urls')),
    path('api/reservas-restaurante/', include('reserva_restaurante.urls')),
    path('api/menus-restaurante/', include('menu_restaurante.urls')),
    path('api/platos/', include('plato.urls')),
    path('api/menu-platos/', include('menu_plato.urls')),
    path('api/mesas-restaurante/', include('restaurante_mesa.urls')),
    path('api/salones-eventos/', include('salon_eventos.urls')),
    path('api/reservas-salon/', include('reserva_salon.urls')),
    path('api/reservas-servicios/', include('reserva_servicio.urls')),
    path('api/tarifas-dinamicas/', include('tarifa_dinamica.urls')),
    path('api/insumos-productos/', include('insumo_producto.urls')),
    path('api/usuarios/', include('usuarios.urls')), 
    path('api/habitaciones/', include('habitaciones.urls')),
   
]

# Servir archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)