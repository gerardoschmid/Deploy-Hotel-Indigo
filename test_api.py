#!/usr/bin/env python3
"""
Script para probar la conexión del API de autenticación
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_endpoints():
    print("🔍 Probando endpoints del API...")
    
    # Test 1: Verificar que el servidor está corriendo
    try:
        response = requests.get(f"{BASE_URL}/admin/")
        if response.status_code == 200:
            print("✅ Servidor Django corriendo correctamente")
        else:
            print("❌ Servidor Django no responde correctamente")
            return
    except requests.exceptions.ConnectionError:
        print("❌ No se puede conectar al servidor Django")
        print("   Asegúrate de que el backend esté corriendo en http://127.0.0.1:8000")
        return
    
    # Test 2: Probar endpoint de registro
    register_data = {
        "username": "test_user",
        "email": "test@example.com",
        "password": "testpass123",
        "first_name": "Test",
        "last_name": "User"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/register/",
            json=register_data,
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 201:
            print("✅ Endpoint de registro funciona correctamente")
        elif response.status_code == 400:
            print("⚠️  Endpoint de registro responde (usuario ya existe)")
        else:
            print(f"❌ Error en registro: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Error al probar registro: {e}")
    
    # Test 3: Probar endpoint de login
    login_data = {
        "username": "test_user",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/token/",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            data = response.json()
            if 'access' in data and 'user' in data:
                print("✅ Endpoint de login funciona correctamente")
                print(f"   Usuario: {data['user']['username']}")
                print(f"   Rol: {data['user']['rol']}")
            else:
                print("❌ Respuesta de login no contiene los campos esperados")
                print(f"   Response: {data}")
        else:
            print(f"❌ Error en login: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Error al probar login: {e}")
    
    # Test 4: Probar endpoint de refresh token
    try:
        # Primero obtenemos un token
        response = requests.post(
            f"{BASE_URL}/api/token/",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            data = response.json()
            refresh_data = {"refresh": data['refresh']}
            
            response = requests.post(
                f"{BASE_URL}/api/token/refresh/",
                json=refresh_data,
                headers={"Content-Type": "application/json"}
            )
            if response.status_code == 200:
                print("✅ Endpoint de refresh token funciona correctamente")
            else:
                print(f"❌ Error en refresh token: {response.status_code}")
    except Exception as e:
        print(f"❌ Error al probar refresh token: {e}")

if __name__ == "__main__":
    test_endpoints()
    print("\n🎉 Pruebas completadas")
