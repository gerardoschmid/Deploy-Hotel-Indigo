# proyectohotel-backend/usuarios/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, 
    PerfilViewSet, 
    RegisterUserView, 
    DashboardStatsView,
    solicitar_recuperacion_password,  # <--- Nueva importación
    confirmar_recuperacion_password   # <--- Nueva importación
)

# 1. Router para ViewSets (Gestión CRUD Protegida)
router = DefaultRouter()
# Gestión de Usuarios: URL base /api/usuarios/gestion/
router.register(r'gestion', UserViewSet, basename='usuarios-gestion') 
# Gestión de Perfiles: URL base /api/usuarios/perfiles/
router.register(r'perfiles', PerfilViewSet, basename='perfiles') 

urlpatterns = [
    # 2. Ruta Específica para el REGISTRO (US-001) - Abierta
    path('registro/', RegisterUserView.as_view(), name='registro'),
    
    # 3. NUEVA RUTA: Estadísticas del Dashboard (Backend Calculado)
    # URL completa: /api/usuarios/dashboard-stats/
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),

    # ---------------------------------------------------------
    # 4. RUTAS DE RECUPERACIÓN DE CONTRASEÑA (NUEVAS)
    # ---------------------------------------------------------
    # Estas coinciden con las llamadas de tu ForgotPasswordPage.jsx
    path('password-reset/solicitar/', solicitar_recuperacion_password, name='password-reset-solicitar'),
    path('password-reset/confirmar/', confirmar_recuperacion_password, name='password-reset-confirmar'),
    
    # 5. Rutas generadas por el Router (gestion y perfiles)
    path('', include(router.urls)), 
]