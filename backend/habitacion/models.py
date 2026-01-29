from django.db import models

class ImagenHabitacion(models.Model):
    """
    Modelo que representa las imágenes de una habitación.
    
    Permite almacenar múltiples imágenes por habitación.
    """
    
    habitacion = models.ForeignKey(
        'Habitacion', 
        on_delete=models.CASCADE, 
        related_name='imagenes'
    )
    imagen = models.ImageField(
        upload_to='habitaciones/',
        blank=True,
        null=True
    )
    url_imagen = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="URL de imagen externa (opcional)"
    )
    orden = models.PositiveIntegerField(
        default=0,
        help_text="Orden en que se mostrará la imagen"
    )
    activa = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'imagen_habitacion'
        verbose_name = 'Imagen de Habitación'
        verbose_name_plural = 'Imágenes de Habitaciones'
        ordering = ['orden', 'id']
    
    def __str__(self):
        return f'Imagen {self.id} - Habitación {self.habitacion.numero_habitacion}'
    
    def get_url(self):
        """Retorna la URL de la imagen, ya sea local o externa"""
        if self.imagen:
            return self.imagen.url
        elif self.url_imagen:
            return self.url_imagen
        return None

class Habitacion(models.Model):
    """
    Modelo que representa una habitación del hotel.
    
    Gestiona toda la información relacionada con las habitaciones,
    incluyendo características, estado, precios y disponibilidad.
    """
    
    # Constantes para opciones de selección
    TIPO_DOBLE = 'doble'
    TIPO_TRIPLE = 'triple'
    TIPO_CUADRUPLE = 'cuadruple'
    
    CAMA_QUEEN = 'queen'
    CAMA_KING = 'king'
    CAMA_TWIN = 'twin'
    
    CATEGORIA_ESTANDAR = 'estandar'
    CATEGORIA_DELUXE = 'deluxe'
    CATEGORIA_SUITE = 'suite'
    CATEGORIA_SUITE_PRESIDENCIAL = 'suite_presidencial'
    CATEGORIA_ESTUDIO = 'estudio'
    
    # Nuevas condiciones simplificadas
    CONDICION_BASICA = 'basica'
    CONDICION_FUNCIONAL = 'funcional'
    CONDICION_CONFORT = 'confort'
    CONDICION_LUJO = 'lujo'
    
    ESTADO_DISPONIBLE = 'disponible'
    ESTADO_OCUPADA = 'ocupada'
    ESTADO_LIMPIEZA = 'limpieza'
    ESTADO_MANTENIMIENTO = 'mantenimiento'
    
    # Opciones para los campos de selección CON MAYÚSCULAS
    TIPO_OCUPACION_CHOICES = [
        (TIPO_DOBLE, 'Doble (2 personas)'),
        (TIPO_TRIPLE, 'Triple (3 personas)'),
        (TIPO_CUADRUPLE, 'Cuádruple (4 personas)'),
    ]
    
    TAMANO_CAMA_CHOICES = [
        (CAMA_QUEEN, 'Queen'),
        (CAMA_KING, 'King'),
        (CAMA_TWIN, 'Twin'),
    ]
    
    CATEGORIA_CHOICES = [
        (CATEGORIA_ESTANDAR, 'Estándar'),
        (CATEGORIA_DELUXE, 'Deluxe'),
        (CATEGORIA_SUITE, 'Suite'),
        (CATEGORIA_SUITE_PRESIDENCIAL, 'Suite Presidencial'),
        (CATEGORIA_ESTUDIO, 'Estudio'),
    ]
    
    # Opciones simplificadas para condición CON MAYÚSCULAS
    CONDICION_CHOICES = [
        (CONDICION_BASICA, 'Básica'),
        (CONDICION_FUNCIONAL, 'Funcional'),
        (CONDICION_CONFORT, 'Confort'),
        (CONDICION_LUJO, 'Lujo'),
    ]
    
    # ESTADO_CHOICES modificado con "En" al inicio
    ESTADO_CHOICES = [
        (ESTADO_DISPONIBLE, 'Disponible'),
        (ESTADO_OCUPADA, 'Ocupada'),
        (ESTADO_LIMPIEZA, 'En Limpieza'),
        (ESTADO_MANTENIMIENTO, 'En Mantenimiento'),
    ]
    
    PISO_CHOICES = [
        (1, 'Piso 1'),
        (2, 'Piso 2'),
        (3, 'Piso 3'),
        (4, 'Piso 4'),
        (5, 'Piso 5'),
        (6, 'Piso 6'),
        (7, 'Piso 7'),
        (8, 'Piso 8'),
    ]
    
    # Mapeo de categoría a condición simplificado
    CATEGORIA_A_CONDICION = {
        CATEGORIA_ESTANDAR: CONDICION_BASICA,
        CATEGORIA_DELUXE: CONDICION_CONFORT,
        CATEGORIA_SUITE: CONDICION_LUJO,
        CATEGORIA_SUITE_PRESIDENCIAL: CONDICION_LUJO,  # También mapea a lujo
        CATEGORIA_ESTUDIO: CONDICION_FUNCIONAL,
    }
    
    # Campos del modelo
    id = models.AutoField(primary_key=True)
    numero_habitacion = models.CharField(max_length=10, unique=True)
    piso = models.IntegerField(choices=PISO_CHOICES, default=1)  
    tipo_ocupacion = models.CharField(
        max_length=20, 
        choices=TIPO_OCUPACION_CHOICES,
        default=TIPO_DOBLE
    )
    tamaño_cama = models.CharField(
        max_length=20, 
        choices=TAMANO_CAMA_CHOICES,
        default=CAMA_QUEEN
    )
    categoria = models.CharField(
        max_length=20, 
        choices=CATEGORIA_CHOICES,
        default=CATEGORIA_ESTANDAR
    )
    caracteristicas = models.TextField(blank=True, null=True)
    descripcion = models.TextField(blank=True, null=True)
    condicion = models.CharField(
        max_length=20, 
        choices=CONDICION_CHOICES,
        editable=False  # No se puede editar manualmente
    )
    estado = models.CharField(
        max_length=20, 
        choices=ESTADO_CHOICES,
        default=ESTADO_DISPONIBLE
    )
    precio_base = models.DecimalField(max_digits=10, decimal_places=2, default=150.00)
    imagen = models.ImageField(
        upload_to='habitaciones/',
        blank=True,
        null=True,
        help_text="Imagen principal de la habitación"
    )
    metros_cuadrados = models.PositiveIntegerField(
        default=45,
        help_text="Metros cuadrados de la habitación"
    )
    activa = models.BooleanField(default=True)

    class Meta:
        db_table = 'habitacion'
        verbose_name = 'Habitación'
        verbose_name_plural = 'Habitaciones'
        ordering = ['piso', 'numero_habitacion']

    def __str__(self):
        return f'Habitación {self.numero_habitacion} - {self.get_categoria_display()}'

    def save(self, *args, **kwargs):
        """Sobrescribir save para asignar condición automáticamente basada en categoría"""
        # Asignar condición automáticamente según la categoría
        self.condicion = self.CATEGORIA_A_CONDICION.get(self.categoria, self.CONDICION_BASICA)
        super().save(*args, **kwargs)

    def get_condicion_display(self):
        """Método para obtener el display de la condición"""
        return dict(self.CONDICION_CHOICES).get(self.condicion, '')
    
    def get_imagenes_urls(self):
        """Retorna una lista de URLs de todas las imágenes de la habitación"""
        imagenes = self.imagenes.filter(activa=True).order_by('orden')
        urls = []
        
        # Primero agregar la imagen principal si existe
        if self.imagen:
            try:
                urls.append(self.imagen.url)
            except ValueError:
                # Caso donde no hay archivo asociado
                pass
        
        # Luego agregar las imágenes adicionales
        for img in imagenes:
            url = img.get_url()
            if url and url not in urls:
                urls.append(url)
        
        # Si no hay imágenes, retornar imágenes por defecto
        if not urls:
            urls = [
                '/static/images/habitaciones/habitacion_king.jpeg',
                '/static/images/habitaciones/habitacion_king.png',
                '/static/images/habitaciones/habitacion_queen.jpeg'
            ]
        
        return urls