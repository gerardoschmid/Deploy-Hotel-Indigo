# proyectohotel-backend/usuarios/models.py
from django.db import models
from django.contrib.auth.models import User # <-- ¡IMPORTANTE! Usamos el User de Django

# Definición de los roles para el campo 'choices' (US-003)
ROLES_USUARIO = [
    ('ADMINISTRADOR', 'Administrador'),
    ('RECEPCIONISTA', 'Recepcionista'),
    ('SUPERVISOR', 'Supervisor'),
    ('CLIENTE', 'Cliente') 
]

class Perfil(models.Model):
    """
    Modelo extendido para guardar el rol y datos adicionales del usuario.
    Se vincula directamente al modelo User de Django.
    """
    # Relación uno a uno con el usuario de Django.
    usuario = models.OneToOneField(User, on_delete=models.CASCADE)
    
    # Campo para almacenar el rol (US-003)
    rol = models.CharField(
        max_length=20, 
        choices=ROLES_USUARIO, 
        default='CLIENTE'
    )
    
    # Campos adicionales que necesitas
    telefono = models.CharField(max_length=15, blank=True, null=True)
    # **Nota:** Documento debe ser único para evitar duplicados
    documento_identidad = models.CharField(max_length=30, unique=True)
    
    def __str__(self):
        # Muestra el nombre de usuario y su rol en la administración
        return f"Perfil de {self.usuario.username} ({self.get_rol_display()})"
    
    class Meta:
        # Usa snake_case para el nombre de la tabla en la BD
        db_table = 'perfil_usuario'
