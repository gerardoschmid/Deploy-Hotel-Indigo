# proyectohotel-backend/backend/urls.py

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve # <--- VITAL PARA RAILWAY

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from usuarios.views import RegisterUserView, MyTokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Auth
    path('api/auth/register/', RegisterUserView.as_view(), name='register'),
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token', MyTokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Apps (Lista limpia y sin duplicados)
    path('api/usuarios/', include('usuarios.urls')), 
    path('api/habitaciones/', include('habitacion.urls')), # Singular (correcto)
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

    # --------------------------------------------------------
    # EL FIX PARA IMÁGENES EN RAILWAY (PRODUCCIÓN)
    # --------------------------------------------------------
    # Esto le permite a Django servir las fotos aunque DEBUG=False
    re_path(r'^media/(?P<path>.*)$', serve, {
        'document_root': settings.MEDIA_ROOT,
    }),
]

# Configuración para desarrollo local
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)