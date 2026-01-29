from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin
from .models import Perfil

# =========================================================
# LIMPIEZA DE REGISTROS PREVIOS
# =========================================================
try:
    if admin.site.is_registered(User):
        admin.site.unregister(User)
except Exception:
    pass

# =========================================================
# CONFIGURACIÓN DEL PERFIL (INLINE)
# =========================================================

class PerfilInline(admin.StackedInline):
    """
    Permite editar el Rol, Teléfono y Documento directamente
    dentro de la vista del Usuario.
    """
    model = Perfil
    can_delete = False
    verbose_name_plural = 'Información Adicional (Perfil y Rol)'
    fields = ('rol', 'telefono', 'documento_identidad')
    fk_name = 'usuario' 

# =========================================================
# CONFIGURACIÓN DEL ADMINISTRADOR DE USUARIOS
# =========================================================

@admin.register(User)
class UsuarioAdmin(UserAdmin):
    """
    Extiende el administrador de User de Django para incluir 
    la información del Perfil de forma integrada.
    """
    inlines = (PerfilInline,)
    
    # Columnas que aparecerán en la lista de usuarios
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'get_rol')
    
    # Optimización: Carga el perfil en una sola consulta
    list_select_related = ('perfil',)

    def get_rol(self, obj):
        """
        Muestra el nombre legible del rol.
        """
        try:
            return obj.perfil.get_rol_display()
        except Exception:
            return "Sin Perfil"
    
    get_rol.short_description = 'Rol del Usuario'

    # RECONFIGURACIÓN MANUAL DE CAMPOS PARA EVITAR ERRORES DE VALIDACIÓN
    # Definimos explícitamente qué grupos de campos queremos mostrar
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Información Personal', {'fields': ('first_name', 'last_name', 'email')}),
        ('Permisos', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Fechas Importantes', {'fields': ('last_login', 'date_joined')}),
    )