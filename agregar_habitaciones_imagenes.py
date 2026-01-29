#!/usr/bin/env python3
"""
Script para agregar 3 habitaciones más con imágenes al sistema
"""

import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from habitacion.models import Habitacion

def agregar_habitaciones_con_imagenes():
    """Agregar 3 habitaciones nuevas con imágenes asignadas"""
    
    # Datos de las nuevas habitaciones
    nuevas_habitaciones = [
        {
            'numero_habitacion': '201',
            'categoria': 'deluxe',
            'tipo_ocupacion': 'doble',
            'estado': 'disponible',
            'piso': 2,
            'tamano_cama': 'king',
            'precio_base': 189.99,
            'metros_cuadrados': 55,
            'descripcion': 'Habitación deluxe con vista a la ciudad, cama king size y amenities premium',
            'capacidad_maxima': 2,
            'imagen': 'habitacion_king.jpeg',
            'imagenes_carrusel': ['habitacion_king.jpeg', 'habitacion2.jpg', 'habitacion3.jpg']
        },
        {
            'numero_habitacion': '202',
            'categoria': 'suite',
            'tipo_ocupacion': 'triple',
            'estado': 'disponible',
            'piso': 2,
            'tamano_cama': 'king',
            'precio_base': 289.99,
            'metros_cuadrados': 75,
            'descripcion': 'Suite espaciosa con sala de estar, cama king y balcón privado',
            'capacidad_maxima': 3,
            'imagen': 'habitacion_queen.jpeg',
            'imagenes_carrusel': ['habitacion_queen.jpeg', 'habitacion2.jpg', 'habitacion3.jpg']
        },
        {
            'numero_habitacion': '301',
            'categoria': 'suite_presidencial',
            'tipo_ocupacion': 'cuadruple',
            'estado': 'disponible',
            'piso': 3,
            'tamano_cama': 'king',
            'precio_base': 449.99,
            'metros_cuadrados': 95,
            'descripcion': 'Suite presidencial con dos ambientes, jacuzzi y vista panorámica',
            'capacidad_maxima': 4,
            'imagen': 'habitacion_king.png',
            'imagenes_carrusel': ['habitacion_king.png', 'habitacion2.jpg', 'habitacion3.jpg']
        }
    ]
    
    habitaciones_creadas = []
    
    for habitacion_data in nuevas_habitaciones:
        try:
            # Verificar si la habitación ya existe
            existe = Habitacion.objects.filter(numero_habitacion=habitacion_data['numero_habitacion']).exists()
            
            if existe:
                print(f"⚠️  La habitación {habitacion_data['numero_habitacion']} ya existe. Actualizando...")
                habitacion = Habitacion.objects.get(numero_habitacion=habitacion_data['numero_habitacion'])
            else:
                print(f"🏨 Creando habitación {habitacion_data['numero_habitacion']}...")
                habitacion = Habitacion()
            
            # Asignar todos los campos
            for key, value in habitacion_data.items():
                if hasattr(habitacion, key):
                    setattr(habitacion, key, value)
            
            habitacion.save()
            habitaciones_creadas.append(habitacion)
            
            print(f"✅ Habitación {habitacion.numero_habitacion} guardada exitosamente")
            print(f"   Categoría: {habitacion.categoria}")
            print(f"   Precio: ${habitacion.precio_base}")
            print(f"   Imagen principal: {habitacion.imagen}")
            print(f"   Imágenes carrusel: {habitacion.imagenes_carrusel}")
            print()
            
        except Exception as e:
            print(f"❌ Error creando habitación {habitacion_data.get('numero_habitacion', 'desconocida')}: {e}")
    
    return habitaciones_creadas

def listar_habitaciones_existentes():
    """Listar todas las habitaciones existentes"""
    print("\n📋 Habitaciones existentes:")
    print("-" * 60)
    
    habitaciones = Habitacion.objects.all().order_by('numero_habitacion')
    
    for habitacion in habitaciones:
        print(f"🏨 {habitacion.numero_habitacion}")
        print(f"   Categoría: {habitacion.categoria}")
        print(f"   Estado: {habitacion.estado}")
        print(f"   Precio: ${habitacion.precio_base}")
        print(f"   Imagen: {habitacion.imagen}")
        print(f"   Carrusel: {habitacion.imagenes_carrusel}")
        print()

def main():
    print("🏨 Agregando habitaciones con imágenes al sistema")
    print("=" * 50)
    
    # Listar habitaciones existentes
    listar_habitaciones_existentes()
    
    # Agregar nuevas habitaciones
    print("\n➕ Agregando nuevas habitaciones...")
    habitaciones_creadas = agregar_habitaciones_con_imagenes()
    
    # Listar todas las habitaciones después de la operación
    print("\n📋 Estado final de habitaciones:")
    listar_habitaciones_existentes()
    
    print(f"\n🎉 Se procesaron {len(habitaciones_creadas)} habitaciones")
    print("\n📋 Resumen:")
    print("   - Se agregaron/actualizaron habitaciones con imágenes")
    print("   - Cada habitación tiene imagen principal y carrusel de 3 imágenes")
    print("   - Las imágenes están disponibles en /assets/images/")
    print("\n🔄 Próximos pasos:")
    print("   1. Reiniciar el servidor backend")
    print("   2. Verificar que las habitaciones aparezcan en el frontend")
    print("   3. Probar el carrusel de imágenes")

if __name__ == "__main__":
    main()
