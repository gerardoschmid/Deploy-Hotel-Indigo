#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script de prueba para el sistema de reservas con envío de emails
Ejecutar desde la carpeta backend: python test_reservas_email.py
"""

import os
import sys
import django
from datetime import date, timedelta

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from reserva_habitacion.models import ReservaHabitacion
from habitacion.models import Habitacion
# from reserva_habitacion.tasks import enviar_email_confirmacion, enviar_ticket_confirmacion  # Temporarily disabled

def crear_datos_prueba():
    """Crear datos de prueba si no existen"""
    print("🔧 Creando datos de prueba...")
    
    # Crear usuario de prueba
    user, created = User.objects.get_or_create(
        username='cliente_prueba',
        defaults={
            'email': 'cliente@test.com',
            'first_name': 'Juan',
            'last_name': 'Pérez'
        }
    )
    
    if created:
        print(f"✅ Usuario creado: {user.username}")
    else:
        print(f"ℹ️  Usuario ya existe: {user.username}")
    
    # Crear habitación de prueba si no existe
    habitacion, created = Habitacion.objects.get_or_create(
        numero_habitacion='101',
        defaults={
            'categoria': 'estandar',
            'tamaño_cama': 'queen',
            'precio_base': 150.00,
            'estado': 'disponible',
            'capacidad_maxima': 2,
            'descripcion': 'Habitación de prueba para testing'
        }
    )
    
    if created:
        print(f"✅ Habitación creada: {habitacion.numero_habitacion}")
    else:
        print(f"ℹ️  Habitación ya existe: {habitacion.numero_habitacion}")
    
    return user, habitacion

def test_crear_reserva():
    """Probar creación de reserva"""
    print("\n📝 Probando creación de reserva...")
    
    user, habitacion = crear_datos_prueba()
    
    # Crear reserva
    fecha_checkin = date.today() + timedelta(days=1)
    fecha_checkout = fecha_checkin + timedelta(days=2)
    
    reserva = ReservaHabitacion.objects.create(
        usuario=user,
        habitacion=habitacion,
        fecha_checkin=fecha_checkin,
        fecha_checkout=fecha_checkout,
        huespedes=2,
        notas='Reserva de prueba para testing del sistema'
    )
    
    print(f"✅ Reserva creada: #{reserva.codigo_confirmacion}")
    print(f"   - Usuario: {reserva.usuario.username}")
    print(f"   - Habitación: {reserva.habitacion.numero_habitacion}")
    print(f"   - Check-in: {reserva.fecha_checkin}")
    print(f"   - Check-out: {reserva.fecha_checkout}")
    print(f"   - Total: ${reserva.total}")
    
    return reserva

def test_generar_otp():
    """Probar generación de OTP"""
    print("\n🔐 Probando generación de OTP...")
    
    reserva = test_crear_reserva()
    codigo_otp = reserva.generar_otp()
    
    print(f"✅ OTP generado: {codigo_otp}")
    print(f"   - Expira: {reserva.otp_expira}")
    print(f"   - Verificado: {reserva.otp_verificado}")
    
    return reserva, codigo_otp

def test_enviar_email_otp():
    """Probar envío de email con OTP"""
    print("\n📧 Probando envío de email con OTP...")
    
    reserva, codigo_otp = test_generar_otp()
    
    try:
        # Enviar email de forma síncrona para testing
        resultado = enviar_email_confirmacion(reserva.pk, codigo_otp)\n        print(f\"✅ Email OTP enviado: {resultado}\")\n        return reserva, codigo_otp\n    except Exception as e:\n        print(f\"❌ Error enviando email OTP: {e}\")\n        return reserva, codigo_otp\n\ndef test_verificar_otp():\n    \"\"\"Probar verificación de OTP\"\"\"\n    print(\"\\n🔍 Probando verificación de OTP...\")\n    \n    reserva, codigo_otp = test_enviar_email_otp()\n    \n    # Verificar OTP correcto\n    if reserva.verificar_otp(codigo_otp):\n        print(f\"✅ OTP verificado correctamente\")\n        print(f\"   - Estado reserva: {reserva.estado}\")\n        print(f\"   - OTP verificado: {reserva.otp_verificado}\")\n    else:\n        print(f\"❌ Error verificando OTP\")\n    \n    return reserva\n\ndef test_enviar_ticket_confirmacion():\n    \"\"\"Probar envío de ticket de confirmación\"\"\"\n    print(\"\\n🎫 Probando envío de ticket de confirmación...\")\n    \n    reserva = test_verificar_otp()\n    \n    try:\n        # Enviar ticket de forma síncrona para testing\n        resultado = enviar_ticket_confirmacion(reserva.pk)\n        print(f\"✅ Ticket enviado: {resultado}\")\n    except Exception as e:\n        print(f\"❌ Error enviando ticket: {e}\")\n    \n    return reserva\n\ndef test_flujo_completo():\n    \"\"\"Probar flujo completo de reserva\"\"\"\n    print(\"\\n🚀 INICIANDO PRUEBA COMPLETA DEL SISTEMA DE RESERVAS\")\n    print(\"=\" * 60)\n    \n    try:\n        reserva = test_enviar_ticket_confirmacion()\n        \n        print(\"\\n\" + \"=\" * 60)\n        print(\"🎉 PRUEBA COMPLETADA EXITOSAMENTE\")\n        print(f\"   - Reserva ID: {reserva.pk}\")\n        print(f\"   - Código: {reserva.codigo_confirmacion}\")\n        print(f\"   - Estado: {reserva.estado}\")\n        print(f\"   - Email: {reserva.usuario.email}\")\n        \n    except Exception as e:\n        print(f\"\\n❌ ERROR EN LA PRUEBA: {e}\")\n        import traceback\n        traceback.print_exc()\n\ndef mostrar_configuracion_email():\n    \"\"\"Mostrar configuración actual de email\"\"\"\n    print(\"\\n📧 CONFIGURACIÓN DE EMAIL:\")\n    print(\"-\" * 40)\n    \n    from django.conf import settings\n    \n    print(f\"EMAIL_BACKEND: {getattr(settings, 'EMAIL_BACKEND', 'No configurado')}\")\n    print(f\"EMAIL_HOST: {getattr(settings, 'EMAIL_HOST', 'No configurado')}\")\n    print(f\"EMAIL_PORT: {getattr(settings, 'EMAIL_PORT', 'No configurado')}\")\n    print(f\"EMAIL_USE_TLS: {getattr(settings, 'EMAIL_USE_TLS', 'No configurado')}\")\n    print(f\"EMAIL_HOST_USER: {getattr(settings, 'EMAIL_HOST_USER', 'No configurado')}\")\n    print(f\"DEFAULT_FROM_EMAIL: {getattr(settings, 'DEFAULT_FROM_EMAIL', 'No configurado')}\")\n\nif __name__ == '__main__':\n    print(\"🏨 SISTEMA DE PRUEBAS - HOTEL INDIGO\")\n    print(\"=\" * 50)\n    \n    mostrar_configuracion_email()\n    test_flujo_completo()\n    \n    print(\"\\n\" + \"=\" * 50)\n    print(\"✨ Pruebas finalizadas\")