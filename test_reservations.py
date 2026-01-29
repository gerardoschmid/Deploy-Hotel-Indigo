#!/usr/bin/env python3
"""
Script para probar el sistema de reservaciones
"""
import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://127.0.0.1:8000"

def login_and_get_token():
    """Iniciar sesión y obtener token"""
    login_data = {
        'username': 'demo_user',
        'password': 'demo123'
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/token/", json=login_data)
        if response.status_code == 200:
            data = response.json()
            return data['access'], data['refresh'], data['user']
        else:
            print(f"❌ Error en login: {response.status_code}")
            print(f"Response: {response.text}")
            return None, None, None
    except Exception as e:
        print(f"❌ Error de conexión en login: {e}")
        return None, None, None

def test_reservations_endpoints():
    print("🔍 Probando endpoints de reservaciones...")
    
    # 1. Login
    print("\n1. Iniciando sesión...")
    token, refresh_token, user = login_and_get_token()
    
    if not token:
        print("❌ No se pudo obtener token. Abortando pruebas.")
        return
    
    print(f"✅ Login exitoso. Usuario: {user['username']}")
    
    # Headers con autenticación
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    # 2. Obtener habitaciones disponibles
    print("\n2. Obteniendo habitaciones disponibles...")
    try:
        response = requests.get(f"{BASE_URL}/api/habitaciones/habitaciones/", headers=headers)
        if response.status_code == 200:
            habitaciones = response.json()
            if habitaciones and len(habitaciones) > 0:
                habitacion = habitaciones[0]
                habitacion_id = habitacion.get('id')
                print(f"✅ Habitación encontrada: ID {habitacion_id}, Número: {habitacion.get('numero_habitacion', 'N/A')}")
            else:
                print("❌ No hay habitaciones disponibles")
                return
        else:
            print(f"❌ Error obteniendo habitaciones: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Error obteniendo habitaciones: {e}")
        return
    
    # 3. Crear reserva
    print("\n3. Creando reserva...")
    tomorrow = datetime.now() + timedelta(days=5)  # Cambiado a 5 días para evitar conflictos
    day_after = datetime.now() + timedelta(days=6)
    
    reserva_data = {
        'habitacion': habitacion_id,
        'fecha_checkin': tomorrow.strftime('%Y-%m-%d'),
        'fecha_checkout': day_after.strftime('%Y-%m-%d'),
        'huespedes': 2
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/reservas-habitacion/", 
                               json=reserva_data, headers=headers)
        
        if response.status_code == 201:
            reserva = response.json()
            reserva_id = reserva['id']
            print(f"✅ Reserva creada: ID {reserva_id}")
            print(f"   Código: {reserva.get('codigo_confirmacion')}")
            print(f"   Estado: {reserva.get('estado')}")
            print(f"   Total: ${reserva.get('total', 0)}")
        else:
            print(f"❌ Error creando reserva: {response.status_code}")
            print(f"Response: {response.text}")
            return
    except Exception as e:
        print(f"❌ Error creando reserva: {e}")
        return
    
    # 4. Obtener reservas del usuario
    print("\n4. Obteniendo reservas del usuario...")
    try:
        response = requests.get(f"{BASE_URL}/api/reservas-habitacion/", headers=headers)
        
        if response.status_code == 200:
            reservas = response.json()
            print(f"✅ Se encontraron {len(reservas)} reservas")
            
            for r in reservas:
                print(f"   - Reserva {r['id']}: {r['codigo_confirmacion']} ({r['estado']})")
        else:
            print(f"❌ Error obteniendo reservas: {response.status_code}")
    except Exception as e:
        print(f"❌ Error obteniendo reservas: {e}")
    
    # 5. Probar OTP (simulado)
    print("\n5. Probando verificación OTP...")
    try:
        # Nota: Esto requeriría el código OTP real del email
        otp_data = {'codigo_otp': '123456'}  # Código de ejemplo
        
        response = requests.post(f"{BASE_URL}/api/reservas-habitacion/{reserva_id}/verificar_otp/",
                               json=otp_data, headers=headers)
        
        if response.status_code == 200:
            print("✅ OTP verificado (simulado)")
        else:
            print(f"⚠️  OTP no verificado (esperado - código de ejemplo): {response.status_code}")
    except Exception as e:
        print(f"❌ Error verificando OTP: {e}")
    
    print("\n🎉 Pruebas de reservaciones completadas")

if __name__ == "__main__":
    test_reservations_endpoints()
