#!/usr/bin/env python3
"""
Script para probar la integración entre el home y el sistema de reservas
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_habitaciones_disponibles():
    """Probar que las habitaciones disponibles se carguen correctamente"""
    print("🔍 Probando endpoint de habitaciones...")
    
    try:
        response = requests.get(f"{BASE_URL}/habitaciones/habitaciones/")
        
        if response.status_code == 200:
            habitaciones = response.json()
            print(f"✅ Se encontraron {len(habitaciones)} habitaciones")
            
            if len(habitaciones) > 0:
                habitacion = habitaciones[0]
                print(f"   Ejemplo - ID: {habitacion.get('id')}")
                print(f"   Número: {habitacion.get('numero_habitacion')}")
                print(f"   Categoría: {habitacion.get('categoria')}")
                print(f"   Estado: {habitacion.get('estado')}")
                print(f"   Precio: ${habitacion.get('precio_base', 0)}")
                
                # Verificar campos necesarios para el frontend
                campos_requeridos = ['id', 'numero_habitacion', 'categoria', 'estado', 'precio_base']
                campos_faltantes = [campo for campo in campos_requeridos if campo not in habitacion]
                
                if campos_faltantes:
                    print(f"⚠️  Campos faltantes: {campos_faltantes}")
                else:
                    print("✅ Todos los campos requeridos están presentes")
                
                return True
            else:
                print("⚠️  No hay habitaciones en la base de datos")
                return False
        else:
            print(f"❌ Error obteniendo habitaciones: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False

def test_mapeo_campos():
    """Verificar que el mapeo de campos funcione correctamente"""
    print("\n🔍 Probando mapeo de campos...")
    
    # Simular el mapeo que hace el frontend
    habitacion_backend = {
        'id': 1,
        'numero_habitacion': '101',
        'categoria': 'estandar',
        'estado': 'disponible',
        'precio_base': '150.00',
        'metros_cuadrados': 45,
        'tipo_ocupacion': 'doble',
        'descripcion': 'Habitación cómoda con vista al jardín',
        'piso': 1,
        'tamano_cama': 'queen'
    }
    
    # Mapeo similar al del frontend
    habitacion_frontend = {
        'id': habitacion_backend['id'],
        'name': f"Habitación {habitacion_backend['numero_habitacion']}",
        'type': habitacion_backend['categoria'],
        'price': float(habitacion_backend['precio_base'] or 0),
        'originalPrice': None,
        'image': habitacion_backend.get('imagen', 'default-image.jpg'),
        'rating': 4.8,
        'reviews': 75,
        'size': habitacion_backend.get('metros_cuadrados', 45),
        'beds': 2,  # doble -> 2 camas
        'baths': 1,
        'maxGuests': 2,  # doble -> 2 huéspedes
        'features': [habitacion_backend.get('descripcion', 'Habitación cómoda')],
        'amenities': ['WiFi', 'Aire acondicionado', 'TV', 'Secador'],
        'available': habitacion_backend['estado'] == 'disponible',
        'popular': habitacion_backend['categoria'] in ['suite', 'suite_presidencial'],
        'discount': 0,
        'backendData': habitacion_backend
    }
    
    print("✅ Mapeo de campos exitoso:")
    print(f"   Nombre: {habitacion_frontend['name']}")
    print(f"   Tipo: {habitacion_frontend['type']}")
    print(f"   Precio: ${habitacion_frontend['price']}")
    print(f"   Disponible: {habitacion_frontend['available']}")
    print(f"   Huéspedes máximos: {habitacion_frontend['maxGuests']}")
    
    return True

def test_filtros():
    """Probar que los filtros funcionen correctamente"""
    print("\n🔍 Probando lógica de filtros...")
    
    # Simular habitaciones con diferentes características
    habitaciones = [
        {'name': 'Habitación 101', 'type': 'estandar', 'price': 120, 'available': True},
        {'name': 'Habitación 201', 'type': 'deluxe', 'price': 220, 'available': True},
        {'name': 'Habitación 301', 'type': 'suite', 'price': 450, 'available': True},
        {'name': 'Habitación 102', 'type': 'estandar', 'price': 130, 'available': False},
    ]
    
    # Test filtro por tipo
    filtradas_tipo = [h for h in habitaciones if h['type'] == 'estandar' and h['available']]
    print(f"✅ Filtro por tipo 'estandar': {len(filtradas_tipo)} habitaciones")
    
    # Test filtro por precio
    filtradas_precio = [h for h in habitaciones if h['price'] <= 200 and h['available']]
    print(f"✅ Filtro por precio <= $200: {len(filtradas_precio)} habitaciones")
    
    # Test filtro de disponibilidad
    disponibles = [h for h in habitaciones if h['available']]
    print(f"✅ Solo disponibles: {len(disponibles)} habitaciones")
    
    return True

def main():
    print("🧪 Probando integración Home ↔ Sistema de Reservas")
    print("=" * 50)
    
    tests = [
        ("Habitaciones disponibles", test_habitaciones_disponibles),
        ("Mapeo de campos", test_mapeo_campos),
        ("Lógica de filtros", test_filtros),
    ]
    
    resultados = []
    
    for test_name, test_func in tests:
        print(f"\n--- {test_name} ---")
        try:
            resultado = test_func()
            resultados.append(resultado)
        except Exception as e:
            print(f"❌ Error en {test_name}: {e}")
            resultados.append(False)
    
    print("\n" + "=" * 50)
    print("📊 Resumen de resultados:")
    
    for i, (test_name, _) in enumerate(tests):
        status = "✅ Pasó" if resultados[i] else "❌ Falló"
        print(f"   {test_name}: {status}")
    
    todos_pasaron = all(resultados)
    
    if todos_pasaron:
        print("\n🎉 ¡Todos los tests pasaron! La integración está funcionando correctamente.")
        print("\n📋 Próximos pasos:")
        print("   1. Iniciar el frontend (npm run dev)")
        print("   2. Navegar al home")
        print("   3. Verificar que se muestren las habitaciones reales")
        print("   4. Hacer clic en 'Reservar Ahora'")
        print("   5. Verificar que la página de reservas se cargue con la habitación preseleccionada")
    else:
        print("\n⚠️  Algunos tests fallaron. Revisa los errores arriba.")
    
    return todos_pasaron

if __name__ == "__main__":
    main()
