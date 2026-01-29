#!/usr/bin/env python
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

def probar_email():
    print("=== PRUEBA DE CONFIGURACIÓN DE EMAIL ===")
    print(f"Backend: {settings.EMAIL_BACKEND}")
    
    if hasattr(settings, 'EMAIL_HOST_USER'):
        print(f"Host: {settings.EMAIL_HOST}")
        print(f"Usuario: {settings.EMAIL_HOST_USER}")
        print(f"Puerto: {settings.EMAIL_PORT}")
    
    print("\n--- Enviando email de prueba ---")
    
    try:
        # Email de prueba
        email_destino = input("Ingresa el email de destino para la prueba: ")
        
        resultado = send_mail(
            'Prueba de Email - Hotel Indigo',
            'Este es un email de prueba para verificar la configuración.\n\nSi recibes este mensaje, ¡la configuración funciona correctamente!',
            settings.DEFAULT_FROM_EMAIL,
            [email_destino],
            fail_silently=False,
        )
        
        if resultado:
            print("✅ Email enviado exitosamente!")
        else:
            print("❌ Error al enviar el email")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\nPosibles soluciones:")
        print("1. Verifica tu email y contraseña")
        print("2. Si usas Gmail, asegúrate de usar una 'Contraseña de aplicación'")
        print("3. Verifica que la verificación en 2 pasos esté activada (Gmail)")

if __name__ == "__main__":
    probar_email()