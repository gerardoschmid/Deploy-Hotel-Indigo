#!/usr/bin/env python3
"""
Script para probar que las reservas eliminadas/canceladas no aparecen al refrescar
"""

import requests
import json
import time

# Configuración
BASE_URL = "http://localhost:8000/api"
USERNAME = "testuser"
PASSWORD = "testpass123"

def login():
    """Iniciar sesión y obtener token"""
    login_data = {
        "username": USERNAME,
        "password": PASSWORD
    }
    response = requests.post(f"{BASE_URL}/token/", data=login_data)
    if response.status_code == 200:
        token_data = response.json()
        return token_data.get("access")
    else:
        print(f"Error en login: {response.status_code}")
        print(response.text)
        return None

def get_reservas(token):
    """Obtener lista de reservas"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/reservas-habitacion/", headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error obteniendo reservas: {response.status_code}")
        print(response.text)
        return None

def cancelar_reserva(token, reserva_id):
    """Cancelar una reserva (PATCH)"""
    headers = {"Authorization": f"Bearer {token}"}
    data = {"estado": "cancelada"}
    response = requests.patch(f"{BASE_URL}/reservas-habitacion/{reserva_id}/", 
                            headers=headers, json=data)
    print(f"PATCH cancelar reserva {reserva_id}: {response.status_code}")
    return response.status_code == 200

def eliminar_reserva(token, reserva_id):
    """Eliminar una reserva (DELETE)"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.delete(f"{BASE_URL}/reservas-habitacion/{reserva_id}/", 
                             headers=headers)
    print(f"DELETE eliminar reserva {reserva_id}: {response.status_code}")
    return response.status_code == 204

def main():
    print("🧪 Probando eliminación de reservas...")
    
    # 1. Login
    print("\n1. Iniciando sesión...")
    token = login()
    if not token:
        return
    
    # 2. Obtener reservas iniciales
    print("\n2. Obteniendo reservas iniciales...")
    reservas_iniciales = get_reservas(token)
    if not reservas_iniciales:
        return
    
    reservas_list = reservas_iniciales if isinstance(reservas_iniciales, list) else reservas_iniciales.get('results', [])
    print(f"   Reservas encontradas: {len(reservas_list)}")
    
    for reserva in reservas_list:
        print(f"   - ID: {reserva['id']}, Estado: {reserva['estado']}, Habitación: {reserva.get('numero_habitacion', 'N/A')}")
    
    if not reservas_list:
        print("   ⚠️  No hay reservas para probar. Crea una reserva primero.")
        return
    
    # 3. Probar cancelación con PATCH
    reserva_a_cancelar = reservas_list[0]
    reserva_id = reserva_a_cancelar['id']
    
    print(f"\n3. Cancelando reserva {reserva_id} con PATCH...")
    if cancelar_reserva(token, reserva_id):
        print("   ✅ Reserva cancelada exitosamente")
        
        # 4. Verificar que no aparezca en la lista
        print("\n4. Verificando que reserva cancelada no aparezca...")
        time.sleep(1)  # Pequeña pausa
        reservas_despues_cancelar = get_reservas(token)
        if reservas_despues_cancelar:
            reservas_despues_list = reservas_despues_cancelar if isinstance(reservas_despues_cancelar, list) else reservas_despues_cancelar.get('results', [])
            reserva_encontrada = any(r['id'] == reserva_id for r in reservas_despues_list)
            
            if reserva_encontrada:
                print("   ❌ ERROR: La reserva cancelada todavía aparece en la lista")
            else:
                print("   ✅ La reserva cancelada NO aparece en la lista (correcto)")
    
    # 5. Si hay más reservas, probar eliminación con DELETE
    reservas_restantes = get_reservas(token)
    if reservas_restantes:
        reservas_restantes_list = reservas_restantes if isinstance(reservas_restantes, list) else reservas_restantes.get('results', [])
        if len(reservas_restantes_list) > 0:
            reserva_a_eliminar = reservas_restantes_list[0]
            reserva_eliminar_id = reserva_a_eliminar['id']
            
            print(f"\n5. Eliminando reserva {reserva_eliminar_id} con DELETE...")
            if eliminar_reserva(token, reserva_eliminar_id):
                print("   ✅ Reserva eliminada exitosamente")
                
                # 6. Verificar que no aparezca en la lista
                print("\n6. Verificando que reserva eliminada no aparezca...")
                time.sleep(1)
                reservas_despues_eliminar = get_reservas(token)
                if reservas_despues_eliminar:
                    reservas_final_list = reservas_despues_eliminar if isinstance(reservas_despues_eliminar, list) else reservas_despues_eliminar.get('results', [])
                    reserva_eliminada_encontrada = any(r['id'] == reserva_eliminar_id for r in reservas_final_list)
                    
                    if reserva_eliminada_encontrada:
                        print("   ❌ ERROR: La reserva eliminada todavía aparece en la lista")
                    else:
                        print("   ✅ La reserva eliminada NO aparece en la lista (correcto)")
    
    print("\n🏁 Prueba completada")

if __name__ == "__main__":
    main()
