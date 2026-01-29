from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Perfil  # <-- Importamos el modelo Perfil

# --- Serializador para Login (CORREGIDO PARA ADMIN) ---
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['is_staff'] = user.is_staff
        return token

    def validate(self, attrs):
        # Lógica para permitir login con email o username
        username = attrs.get('username', '')
        if '@' in username:
            try:
                user = User.objects.get(email=username)
                attrs['username'] = user.username
            except User.DoesNotExist:
                pass

        data = super().validate(attrs)
        
        # Intentamos obtener el rol del perfil
        # Si es un superusuario antiguo sin perfil, asignamos 'ADMINISTRADOR' por defecto en la respuesta
        try:
            rol = self.user.perfil.rol
        except:
            if self.user.is_staff:
                rol = 'ADMINISTRADOR'
            else:
                rol = 'CLIENTE'

        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'is_staff': self.user.is_staff, # <--- ¡ESTA LÍNEA ES VITAL PARA EL LOGIN ADMIN!
            'rol': rol
        }
        return data

class UsuarioAdminSerializer(serializers.ModelSerializer):
    total_reservas = serializers.IntegerField(read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'date_joined', 'total_reservas']

# --- Serializador de Registro ---
class RegistroUsuarioSerializer(serializers.ModelSerializer):
    # 1. Validamos que el email sea obligatorio y ÚNICO
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all(), message="Este correo electrónico ya está registrado.")]
    )
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']
    
    def create(self, validated_data):
        # 2. Creamos el usuario de Django
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )

        # 3. Creamos automáticamente el Perfil asociado
        Perfil.objects.create(
            usuario=user,
            rol='CLIENTE',
            documento_identidad=f"TEMP-{user.username}" 
        )

        return user

class PerfilSerializer(serializers.Serializer):
    username = serializers.CharField(source='usuario.username')
    email = serializers.EmailField(source='usuario.email')
    rol = serializers.CharField()