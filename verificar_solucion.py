#!/usr/bin/env python3
"""
Verificación simple de que la solución funciona
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_api():
    """Probar que la API excluye reservas canceladas"""
    
    # 1. Login
    login_data = {"username": "testuser", "password": "testpass123"}
    response = requests.post(f"{BASE_URL}/token/", data=login_data)
    
    if response.status_code != 200:
        print("❌ Error en login")
        return False
    
    token = response.json().get("access")
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Obtener reservas
    response = requests.get(f"{BASE_URL}/reservas-habitacion/", headers=headers)
    
    if response.status_code != 200:
        print("❌ Error obteniendo reservas")
        return False
    
    reservas = response.json()
    reservas_list = reservas if isinstance(reservas, list) else reservas.get('results', [])
    
    print(f"✅ API funciona correctamente")
    print(f"📊 Reservas activas encontradas: {len(reservas_list)}")
    
    # 3. Verificar que no haya reservas canceladas
    canceladas_encontradas = [r for r in reservas_list if r.get('estado') == 'cancelada']
    
    if canceladas_encontradas:
        print(f"❌ ERROR: Se encontraron {len(canceladas_encontradas)} reservas canceladas")
        return False
    else:
        print("✅ No se encontraron reservas canceladas (correcto)")
        return True

if __name__ == "__main__":
    print("🔍 Verificando solución para eliminación de reservas...")
    print("=" * 50)
    
    if test_api():
        print("\n🎉 SOLUCIÓN VERIFICADA: Las reservas canceladas no aparecen en la lista")
    else:
        print("\n⚠️  Hay problemas con la solución")
