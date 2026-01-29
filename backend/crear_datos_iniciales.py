#!/usr/bin/env python
"""
Script para crear datos iniciales de mesas y salones
Ejecutar: python manage.py shell < crear_datos_iniciales.py
"""

import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from restaurante_mesa.models import RestauranteMesa
from salon_eventos.models import SalonEvento

def crear_mesas_iniciales():
    """Crear 10 mesas con diferentes capacidades y ubicaciones"""
    
    mesas_data = [
        {"numero_mesa": "Mesa 1", "capacidad": 2},
        {"numero_mesa": "Mesa 2", "capacidad": 4},
        {"numero_mesa": "Mesa 3", "capacidad": 2},
        {"numero_mesa": "Mesa 4", "capacidad": 6},
        {"numero_mesa": "Mesa 5", "capacidad": 4},
        {"numero_mesa": "Mesa 6", "capacidad": 2},
        {"numero_mesa": "Mesa 7", "capacidad": 8},
        {"numero_mesa": "Mesa 8", "capacidad": 4},
        {"numero_mesa": "Mesa 9", "capacidad": 6},
        {"numero_mesa": "Mesa 10", "capacidad": 2},
    ]
    
    print("🍽️ Creando mesas iniciales...")
    
    for mesa_data in mesas_data:
        # Verificar si ya existe
        if RestauranteMesa.objects.filter(numero_mesa=mesa_data["numero_mesa"]).exists():
            print(f"  ⚠️  {mesa_data['numero_mesa']} ya existe")
            continue
            
        mesa = RestauranteMesa.objects.create(
            numero_mesa=mesa_data["numero_mesa"],
            capacidad=mesa_data["capacidad"]
        )
        print(f"  ✅ Creada {mesa.numero_mesa} - Capacidad: {mesa.capacidad} personas")
    
    print(f"📊 Total mesas: {RestauranteMesa.objects.count()}")

def crear_salones_iniciales():
    """Crear 10 salones con diferentes capacidades y descripciones"""
    
    salones_data = [
        {"nombre": "Salón Imperial", "descripcion": "Elegante y espacioso, perfecto para bodas de lujo y eventos corporativos importantes. Decorado con cristalería fina y iluminación sofisticada.", "capacidad": 150},
        {"nombre": "Salón Jardín", "descripcion": "Ambiente natural con vista a jardines tropicales. Ideal para ceremonias íntimas y recepciones al aire libre.", "capacidad": 80},
        {"nombre": "Salón Real", "descripcion": "Diseño clásico europeo con techos altos y acabados dorados. Perfecto para galas y eventos de alta categoría.", "capacidad": 120},
        {"nombre": "Salón Terraza", "descripcion": "Espacio abierto con vista panorámica a la ciudad. Excelente para cócteles y eventos nocturnos.", "capacidad": 60},
        {"nombre": "Salón Diamante", "descripcion": "Moderno y minimalista con tecnología audiovisual de última generación. Ideal para presentaciones corporativas.", "capacidad": 100},
        {"nombre": "Salón Primavera", "descripcion": "Decoración floral y colores vibrantes. Perfecto para bautizos, comuniones y celebraciones familiares.", "capacidad": 70},
        {"nombre": "Salón Imperio", "descripcion": "Estilo imperial con columnas majestuosas y detalles arquitectónicos históricos. Magnífico para eventos formales.", "capacidad": 200},
        {"nombre": "Salón Luna", "descripcion": "Iluminación tenue y ambiente romántico. Ideal para cenas de gala y celebraciones nocturnas exclusivas.", "capacidad": 50},
        {"nombre": "Salón Sol", "descripcion": "Espacio luminoso con grandes ventanales. Perfecto para conferencias y eventos diurnos.", "capacidad": 90},
        {"nombre": "Salón Estrella", "descripcion": "Techo retráctil con vista al cielo nocturno. Único para eventos mágicos y memorables.", "capacidad": 110},
    ]
    
    print("\n🎉 Creando salones iniciales...")
    
    for salon_data in salones_data:
        # Verificar si ya existe
        if SalonEvento.objects.filter(nombre=salon_data["nombre"]).exists():
            print(f"  ⚠️  {salon_data['nombre']} ya existe")
            continue
            
        salon = SalonEvento.objects.create(
            nombre=salon_data["nombre"],
            descripcion=salon_data["descripcion"]
        )
        print(f"  ✅ Creado {salon.nombre} - Capacidad aproximada: {salon_data['capacidad']} personas")
    
    print(f"📊 Total salones: {SalonEvento.objects.count()}")

def main():
    """Función principal para ejecutar todo"""
    print("🏨 Hotel Indigo - Creación de Datos Iniciales")
    print("=" * 50)
    
    try:
        crear_mesas_iniciales()
        crear_salones_iniciales()
        
        print("\n" + "=" * 50)
        print("🎉 ¡Datos iniciales creados exitosamente!")
        print("📊 Resumen:")
        print(f"   - Mesas creadas: {RestauranteMesa.objects.count()}")
        print(f"   - Salones creados: {SalonEvento.objects.count()}")
        print("\n✅ Listo para empezar a gestionar reservas!")
        
    except Exception as e:
        print(f"❌ Error creando datos: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
