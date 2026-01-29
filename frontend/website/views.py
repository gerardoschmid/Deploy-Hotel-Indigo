import requests
# website/views.py (Modificado)
from django.shortcuts import render, redirect

from django.contrib import messages
BACKEND_BASE_URL = "http://127.0.0.1:8000"
API_REGISTER = "http://127.0.0.1:8000/api/usuarios/"

def index(request):
    # Ahora especificamos la ruta COMPLETA: 'nombre_de_la_app/nombre_del_archivo.html'
    return render(request, 'website/index.html')
# Puedes agregar más vistas aquí, por ejemplo, para la página "Nosotros"
def nosotros(request):
    """
    Renderiza la página "Nosotros".
    """
    # Usamos la ruta anidada
    return render(request, 'website/nosotros.html')

def acceso(request):
    """
    Renderiza la página de Acceso para administradores.
    """
    # Usamos la ruta anidada
    return render(request, 'website/acceso.html')

def habitaciones(request):
    """
    Renderiza la página de listado de habitaciones.
    """
    # Usamos la ruta anidada
    return render(request, 'website/habitaciones.html')

def reserva(request):
    """
    Renderiza el formulario de reserva de habitaciones.
    """
    return render(request, 'website/reserva_habitaciones.html')

def eventos(request):
    """
    Renderiza la página de salones y eventos.
    """
    return render(request, 'website/eventos.html') 

def reserva_eventos(request):
    """
    Renderiza el formulario de cotización/reserva de eventos.
    (Pendiente de HTML)
    """
    # Usaremos una plantilla simple de "en construcción" por ahora si no tienes el HTML
    return render(request, 'website/reserva_salon.html')

def detalle_habitacion(request, habitacion_id):
    """
    Renderiza la página de detalle de una habitación específica.
    En un proyecto real, se usaría habitacion_id para buscar datos.
    """
    # El ID se usa en el backend para buscar, pero lo pasamos aquí
    context = {'habitacion_id': habitacion_id} 
    return render(request, 'website/detalle_habitacion.html', context)


def servicios(request):
    """
    Renderiza la página de Servicios y Servicios Adicionales.
    Corresponde a la tabla servicio_adicional en la DB.
    """
    return render(request, 'website/servicios.html')

def reserva_restaurante(request):
    """
    Renderiza el formulario de reserva de restaurante.
    """
    # Apunta a la plantilla de reserva de mesa
    return render(request, 'website/reservar_mesa.html') 

def restaurante(request):
    """
    Renderiza la página principal del restaurante (o redirige a la reserva).
    """
    # Podemos hacer que la URL principal del restaurante cargue directamente la reserva, 
    # o si tienes una plantilla de menú, puedes apuntar a ella.
    return render(request, 'website/reservar_mesa.html') 

# Opcional: Si tienes una URL para el menú, asegúrate de que esta exista
def restaurante_menu(request):
    """
    Renderiza la página del menú del restaurante (placeholder).
    """
    return render(request, 'website/menu.html')

def galeria(request):
    return render(request, 'website/galeria.html')

def contacto(request):
    """Renderiza la página de contacto."""
    return render(request, 'website/contacto.html')

def admin_panel_base(request):
    """
    Renderiza la plantilla base del panel de administración.
    La plantilla se encuentra en website/templates/website/admin/admin_base.html
    """
    # Importante: La ruta incluye la subcarpeta 'admin/'
    return render(request, 'website/admin/admin_base.html')

def empleo(request):
    """
    Renderiza la página de 'Trabaja con Nosotros'.
    """
    return render(request, 'website/empleo.html')


# --- CONFIGURACIÓN ---
# Cambia esto por la IP/Dominio real de tu servidor Backend cuando lo subas a producción
# Cambia esto por la ruta que realmente exista en tu backend

# frontend/website/views.py

def procesar_reserva(request):
    if request.method == "POST":
        # Verificar si es verificación de OTP
        if 'otp_code' in request.POST:
            return verificar_otp_reserva(request)
            
        # 1. Recolección de datos del formulario
        nombre_huesped = request.POST.get('nombre')
        email = request.POST.get('email')
        cedula = request.POST.get('cedula')
        telefono = request.POST.get('telefono')
        habitacion_id = request.POST.get('habitacion_id')
        checkin = request.POST.get('llegada')
        checkout = request.POST.get('salida')
        huespedes = request.POST.get('huespedes', 1)

        # 2. DEFINIR EL PAYLOAD
        payload_usuario = {
            "username": email,
            "email": email,
            "password": cedula, 
            "first_name": nombre_huesped,
            "documento_identidad": cedula, 
            "telefono": telefono
        }

        try:
            # 3. Registro en el endpoint público
            URL_REGISTRO = f"{BACKEND_BASE_URL}/api/auth/register/"
            res_user = requests.post(URL_REGISTRO, json=payload_usuario)
            
            if res_user.status_code == 201:
                user_data = res_user.json()
                user_id = user_data.get('id')
                
                # 4. Crear la reserva vinculada al usuario creado
                payload_reserva = {
                    "usuario": user_id,
                    "habitacion": habitacion_id,
                    "fecha_checkin": checkin,
                    "fecha_checkout": checkout,
                    "huespedes": int(huespedes),
                    "estado": "pendiente"
                }

                res_reserva = requests.post(f"{BACKEND_BASE_URL}/api/reservas-habitacion/", json=payload_reserva)

                if res_reserva.status_code == 201:
                    reserva_data = res_reserva.json()
                    reserva_id = reserva_data.get('id')
                    
                    # Generar código demo para desarrollo
                    import random
                    codigo_demo = ''.join([str(random.randint(0, 9)) for _ in range(6)])
                    
                    # Guardar en sesión
                    request.session['reserva_id'] = reserva_id
                    request.session['email_usuario'] = email
                    request.session['codigo_demo'] = codigo_demo
                    
                    # Renderizar con código visible para desarrollo
                    return render(request, 'website/reserva_habitaciones.html', {
                        'codigo_enviado': True,
                        'email_destino': email,
                        'codigo_demo': codigo_demo
                    })
                else:
                    print(f"Error en Reserva: {res_reserva.text}")
                    messages.error(request, "La habitación no está disponible para esas fechas.")
            else:
                print(f"Error en Usuario: {res_user.text}")
                messages.error(request, "El correo ya está registrado o los datos son incorrectos.")

        except Exception as e:
            print(f"Error crítico en la vista: {str(e)}")
            messages.error(request, "Error de conexión con el servidor.")

    # Si hay error, regresa a la página de la reserva
    return redirect(request.META.get('HTTP_REFERER', '/'))

def verificar_otp_reserva(request):
    """Función para verificar el código OTP ingresado"""
    codigo_otp = request.POST.get('otp_code')
    reserva_id = request.session.get('reserva_id')
    codigo_demo = request.session.get('codigo_demo')
    
    if not reserva_id or not codigo_otp:
        messages.error(request, "Código o sesión inválida.")
        return redirect('reserva')
    
    # Verificar código demo (para desarrollo)
    if codigo_demo and codigo_otp == codigo_demo:
        # Código correcto - limpiar sesión y mostrar éxito
        request.session.pop('reserva_id', None)
        request.session.pop('email_usuario', None)
        request.session.pop('codigo_demo', None)
        
        return render(request, 'website/reserva_habitaciones.html', {
            'reserva_exitosa': True
        })
    else:
        # Código incorrecto
        messages.error(request, 'Código inválido')
        return render(request, 'website/reserva_habitaciones.html', {
            'codigo_enviado': True,
            'email_destino': request.session.get('email_usuario'),
            'codigo_demo': codigo_demo,
            'error_otp': True
        })

def reenviar_otp(request):
    """Función para reenviar el código OTP"""
    reserva_id = request.session.get('reserva_id')
    
    if not reserva_id:
        messages.error(request, "Sesión inválida.")
        return redirect('reserva')
    
    try:
        url_reenviar = f"{BACKEND_BASE_URL}/api/reservas-habitacion/{reserva_id}/reenviar_otp/"
        response = requests.post(url_reenviar)
        
        if response.status_code == 200:
            messages.success(request, "Código reenviado exitosamente.")
        else:
            messages.error(request, "Error al reenviar el código.")
            
    except Exception as e:
        print(f"Error reenviando OTP: {str(e)}")
        messages.error(request, "Error de conexión con el servidor.")
    
    return render(request, 'website/reserva_habitaciones.html', {
        'codigo_enviado': True,
        'email_destino': request.session.get('email_usuario')
    })