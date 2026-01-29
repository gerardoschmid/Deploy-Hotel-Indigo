from django.db import models


class Plato(models.Model):
    """
    Modelo que representa un plato del restaurante.
    
    Gestiona toda la información relacionada con los platos del menú,
    incluyendo características, precios, imágenes y disponibilidad.
    """
    
    # Constantes para categorías
    CATEGORIA_ENTRADA = 'entrada'
    CATEGORIA_PRINCIPAL = 'principal'
    CATEGORIA_POSTRE = 'postre'
    CATEGORIA_BEBIDA = 'bebida'
    CATEGORIA_APERITIVO = 'aperitivo'
    CATEGORIA_ENSALADA = 'ensalada'
    CATEGORIA_SOPA = 'sopa'
    CATEGORIA_GUARNICION = 'guarnicion'
    
    CATEGORIA_CHOICES = [
        (CATEGORIA_ENTRADA, 'Entrada'),
        (CATEGORIA_PRINCIPAL, 'Plato Principal'),
        (CATEGORIA_POSTRE, 'Postre'),
        (CATEGORIA_BEBIDA, 'Bebida'),
        (CATEGORIA_APERITIVO, 'Aperitivo'),
        (CATEGORIA_ENSALADA, 'Ensalada'),
        (CATEGORIA_SOPA, 'Sopa'),
        (CATEGORIA_GUARNICION, 'Guarnición'),
    ]
    
    # Constantes para alérgenos
    ALERGENO_GLUTEN = 'gluten'
    ALERGENO_LACTEOS = 'lacteos'
    ALERGENO_FRUTOS_SECOS = 'frutos_secos'
    ALERGENO_MARISCOS = 'mariscos'
    ALERGENO_HUEVOS = 'huevos'
    ALERGENO_SOJA = 'soja'
    ALERGENO_PESCADO = 'pescado'
    ALERGENO_MOSTAZA = 'mostaza'
    ALERGENO_SESAMO = 'sesamo'
    ALERGENO_APIO = 'apio'
    ALERGENO_ALTRAMUCES = 'altramuces'
    ALERGENO_MOLUSCOS = 'moluscos'
    
    ALERGENO_CHOICES = [
        (ALERGENO_GLUTEN, 'Gluten'),
        (ALERGENO_LACTEOS, 'Lácteos'),
        (ALERGENO_FRUTOS_SECOS, 'Frutos Secos'),
        (ALERGENO_MARISCOS, 'Mariscos'),
        (ALERGENO_HUEVOS, 'Huevos'),
        (ALERGENO_SOJA, 'Soja'),
        (ALERGENO_PESCADO, 'Pescado'),
        (ALERGENO_MOSTAZA, 'Mostaza'),
        (ALERGENO_SESAMO, 'Sésamo'),
        (ALERGENO_APIO, 'Apio'),
        (ALERGENO_ALTRAMUCES, 'Altramuces'),
        (ALERGENO_MOLUSCOS, 'Moluscos'),
    ]
    
    # Campos del modelo
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=200, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    categoria = models.CharField(
        max_length=20,
        choices=CATEGORIA_CHOICES,
        default=CATEGORIA_PRINCIPAL
    )
    precio = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    ingredientes = models.TextField(
        blank=True, 
        null=True,
        help_text="Lista de ingredientes separados por comas"
    )
    alergenos = models.ManyToManyField(
        'Alergeno',
        blank=True,
        related_name='platos'
    )
    tiempo_preparacion = models.PositiveIntegerField(
        default=15,
        help_text="Tiempo de preparación en minutos"
    )
    imagen = models.ImageField(
        upload_to='platos/',
        blank=True,
        null=True,
        help_text="Imagen del plato"
    )
    url_imagen = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="URL de imagen externa (opcional)"
    )
    disponible = models.BooleanField(default=True)
    activo = models.BooleanField(default=True)
    orden = models.PositiveIntegerField(
        default=0,
        help_text="Orden en que se mostrará en el menú"
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True, null=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'plato'
        verbose_name = 'Plato'
        verbose_name_plural = 'Platos'
        ordering = ['categoria', 'orden', 'nombre']
    
    def __str__(self):
        return f'{self.nombre} - ${self.precio:.2f}'
    
    def get_url_imagen(self):
        """Retorna la URL de la imagen, ya sea local o externa"""
        if self.imagen:
            return self.imagen.url
        elif self.url_imagen:
            return self.url_imagen
        return '/static/images/platos/default_plato.jpg'
    
    def get_lista_ingredientes(self):
        """Retorna la lista de ingredientes como un array"""
        if self.ingredientes:
            return [ing.strip() for ing in self.ingredientes.split(',') if ing.strip()]
        return []
    
    def get_lista_alergenos(self):
        """Retorna la lista de nombres de alérgenos"""
        return [alergeno.nombre for alergeno in self.alergenos.all()]


class Alergeno(models.Model):
    """
    Modelo para gestionar información de alérgenos.
    """
    
    nombre = models.CharField(max_length=50, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    icono = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Nombre del icono (ej: gluten, lacteos, etc.)"
    )
    
    class Meta:
        db_table = 'alergeno'
        verbose_name = 'Alérgeno'
        verbose_name_plural = 'Alérgenos'
        ordering = ['nombre']
    
    def __str__(self):
        return self.nombre
