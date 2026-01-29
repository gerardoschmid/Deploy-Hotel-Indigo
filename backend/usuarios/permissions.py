# proyectohotel-backend/usuarios/permissions.py
# usuarios/permissions.py

# Corrección: se Importo el módulo completo 'permissions' para usar permissions.SAFE_METHODS
from rest_framework import permissions
from rest_framework.permissions import BasePermission # BasePermission es redundante si usas permissions.BasePermission, pero lo dejaremos para claridad.
from django.contrib.auth.models import User # Necesario para la clase IsOwnerOrAdmin
from .models import Perfil 

# Función auxiliar para obtener el rol de forma segura
def get_user_role(user):
    """Devuelve el rol del usuario o None si no está autenticado o no tiene perfil."""
    if not user.is_authenticated:
        return None
    
    # Accede al perfil directamente usando la relación OneToOne (request.user.perfil)
    if hasattr(user, 'perfil'):
        return user.perfil.rol
    return None

class IsAdministrador(BasePermission):
    """Permite acceso solo a usuarios con rol 'ADMINISTRADOR'."""
    def has_permission(self, request, view):
        rol = get_user_role(request.user)
        return rol == 'ADMINISTRADOR'

class IsRecepcionista(BasePermission):
    """Permite acceso solo a usuarios con rol 'RECEPCIONISTA' o 'ADMINISTRADOR'."""
    def has_permission(self, request, view):
        rol = get_user_role(request.user)
        # Permite a recepcionista y también al administrador
        return rol in ['RECEPCIONISTA', 'ADMINISTRADOR'] 

# --- Permiso de Nivel de Objeto (Importante para IsAdminOrOwner) ---
class IsOwnerOrAdmin(BasePermission):
    """Permite la edición del objeto si es el dueño o un Administrador."""
    
    def has_object_permission(self, request, view, obj):
        rol = get_user_role(request.user)
        
        # 1. Los Administradores siempre tienen acceso de objeto
        if rol == 'ADMINISTRADOR':
            return True
        
        # 2. Acceso de solo lectura (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return True

        # 3. Acceso de Dueño (Si el objeto es User, el dueño es el usuario actual)
        if isinstance(obj, User):
            return obj == request.user
        
        # 4. Acceso de Dueño (Si el objeto es Perfil, el dueño es el usuario asociado)
        if hasattr(obj, 'usuario'):
            return obj.usuario == request.user
            
        return False