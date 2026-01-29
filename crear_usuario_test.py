#!/usr/bin/env python3
"""
Crear usuario de prueba para las pruebas
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def crear_usuario():
    """Crear usuario de prueba"""
    user_data = {
        "username": "testuser",
        "password": "testpass123",
        "password2": "testpass123",
        "email": "test@example.com",
        "first_name": "Test",
        "last_name": "User"
    }
    
    response = requests.post(f"{BASE_URL}/auth/register/", json=user_data)
    print(f"Registro: {response.status_code}")
    if response.status_code == 201:
        print("✅ Usuario creado exitosamente")
        print(response.json())
    else:
        print("❌ Error creando usuario")
        print(response.text)

if __name__ == "__main__":
    crear_usuario()
