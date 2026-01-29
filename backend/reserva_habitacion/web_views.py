# reserva_habitacion/web_views.py

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.views import View
import json
from .models import ReservaHabitacion
from habitacion.models import Habitacion
# from .tasks import enviar_email_confirmacion, enviar_ticket_confirmacion  # Temporarily disabled

class ReservaWebView(View):
    """Vista para manejar reservas desde el frontend web"""
    
    def get(self, request):
        """Mostrar formulario de reserva"""
        habitacion_id = request.GET.get('habitacion_id')
        habitacion = None
        
        if habitacion_id:
            try:
                habitacion = Habitacion.objects.get(id=habitacion_id)
            except Habitacion.DoesNotExist:
                messages.error(request, 'Habitación no encontrada')
                return redirect('habitaciones')
        
        context = {
            'habitacion': habitacion,
            'habitacion_id': habitacion_id
        }
        return render(request, 'reserva_habitacion/reserva_form.html', context)
    
    def post(self, request):
        """Procesar reserva"""
        try:
            # Obtener datos del formulario
            data = json.loads(request.body) if request.content_type == 'application/json' else request.POST
            
            # Crear o obtener usuario
            email = data.get('email')
            nombre = data.get('nombre', '')
            apellido = data.get('apellido', '')
            
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email,
                    'first_name': nombre,
                    'last_name': apellido,
                }
            )
            
            # Si el usuario ya existe, actualizar nombre si está vacío
            if not created and not user.first_name:
                user.first_name = nombre
                user.last_name = apellido
                user.save()
            
            # Crear reserva
            habitacion_id = data.get('habitacion_id') or data.get('habitacion')
            habitacion = get_object_or_404(Habitacion, id=habitacion_id)
            
            reserva = ReservaHabitacion.objects.create(
                usuario=user,
                habitacion=habitacion,
                fecha_checkin=data.get('fecha_checkin'),
                fecha_checkout=data.get('fecha_checkout'),
                huespedes=int(data.get('huespedes', 1)),
                notas=data.get('notas', '')
            )
            
            # Generar y enviar OTP
            codigo_otp = reserva.generar_otp()
            enviar_email_confirmacion.delay(reserva.pk, codigo_otp)
            
            if request.content_type == 'application/json':
                return JsonResponse({
                    'success': True,
                    'reserva_id': reserva.pk,
                    'message': 'Reserva creada exitosamente'
                })
            else:
                request.session['reserva_id'] = reserva.pk
                request.session['email_destino'] = email
                return redirect('verificar_otp')
                
        except Exception as e:
            if request.content_type == 'application/json':
                return JsonResponse({
                    'success': False,
                    'error': str(e)
                }, status=400)
            else:
                messages.error(request, f'Error al crear reserva: {str(e)}')
                return redirect('reserva_habitacion')

class VerificarOTPView(View):
    """Vista para verificar código OTP"""
    
    def get(self, request):
        """Mostrar formulario de verificación OTP"""
        reserva_id = request.session.get('reserva_id')
        email_destino = request.session.get('email_destino')
        
        if not reserva_id:
            messages.error(request, 'Sesión expirada')
            return redirect('reserva_habitacion')
        
        try:
            reserva = ReservaHabitacion.objects.get(pk=reserva_id)
        except ReservaHabitacion.DoesNotExist:
            messages.error(request, 'Reserva no encontrada')
            return redirect('reserva_habitacion')
        
        context = {
            'reserva': reserva,
            'email_destino': email_destino,
            'codigo_enviado': True
        }
        return render(request, 'reserva_habitacion/verificar_otp.html', context)
    
    def post(self, request):
        """Verificar código OTP"""
        try:
            data = json.loads(request.body) if request.content_type == 'application/json' else request.POST
            
            reserva_id = data.get('reserva_id') or request.session.get('reserva_id')
            codigo_otp = data.get('codigo_otp')
            
            if not reserva_id or not codigo_otp:
                raise ValueError('Datos incompletos')
            
            reserva = get_object_or_404(ReservaHabitacion, pk=reserva_id)
            
            if reserva.verificar_otp(codigo_otp):
                # Enviar ticket de confirmación
                enviar_ticket_confirmacion.delay(reserva.pk)
                
                # Limpiar sesión
                if 'reserva_id' in request.session:
                    del request.session['reserva_id']
                if 'email_destino' in request.session:
                    del request.session['email_destino']
                
                if request.content_type == 'application/json':
                    return JsonResponse({
                        'success': True,
                        'message': 'Reserva confirmada exitosamente'
                    })
                else:
                    messages.success(request, 'Reserva confirmada exitosamente')
                    return redirect('reserva_exitosa')
            else:
                if request.content_type == 'application/json':
                    return JsonResponse({
                        'success': False,
                        'error': 'Código inválido o expirado'
                    }, status=400)
                else:
                    messages.error(request, 'Código inválido o expirado')
                    return redirect('verificar_otp')
                    
        except Exception as e:
            if request.content_type == 'application/json':
                return JsonResponse({
                    'success': False,
                    'error': str(e)
                }, status=400)
            else:
                messages.error(request, f'Error: {str(e)}')
                return redirect('verificar_otp')

class ReenviarOTPView(View):
    """Vista para reenviar código OTP"""
    
    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)
    
    def post(self, request):
        """Reenviar código OTP"""
        try:
            data = json.loads(request.body) if request.content_type == 'application/json' else request.POST
            
            reserva_id = data.get('reserva_id') or request.session.get('reserva_id')
            
            if not reserva_id:
                raise ValueError('ID de reserva requerido')
            
            reserva = get_object_or_404(ReservaHabitacion, pk=reserva_id)
            
            # Generar nuevo código
            codigo_otp = reserva.generar_otp()
            
            # Enviar nuevo email
            enviar_email_confirmacion.delay(reserva.pk, codigo_otp)
            
            if request.content_type == 'application/json':
                return JsonResponse({
                    'success': True,
                    'message': 'Código reenviado exitosamente'
                })
            else:
                messages.success(request, 'Código reenviado exitosamente')
                return redirect('verificar_otp')
                
        except Exception as e:
            if request.content_type == 'application/json':
                return JsonResponse({
                    'success': False,
                    'error': str(e)
                }, status=400)
            else:
                messages.error(request, f'Error: {str(e)}')
                return redirect('verificar_otp')

def reserva_exitosa(request):
    """Vista de confirmación de reserva exitosa"""
    return render(request, 'reserva_habitacion/reserva_exitosa.html')

@csrf_exempt
@require_http_methods(["POST"])
def api_crear_reserva(request):
    """API endpoint para crear reserva desde JavaScript"""
    try:
        data = json.loads(request.body)
        
        # Crear o obtener usuario
        email = data.get('email')
        nombre = data.get('nombre', '')
        apellido = data.get('apellido', '')
        
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email,
                'first_name': nombre,
                'last_name': apellido,
            }
        )
        
        # Crear reserva
        habitacion = get_object_or_404(Habitacion, id=data.get('habitacion_id'))
        
        reserva = ReservaHabitacion.objects.create(
            usuario=user,
            habitacion=habitacion,
            fecha_checkin=data.get('fecha_checkin'),
            fecha_checkout=data.get('fecha_checkout'),
            huespedes=int(data.get('huespedes', 1)),
            notas=f"Nombre: {nombre} {apellido}, Cédula: {data.get('cedula', '')}, Teléfono: {data.get('telefono', '')}. {data.get('notas', '')}"
        )
        
        # Generar y enviar OTP
        codigo_otp = reserva.generar_otp()
        enviar_email_confirmacion.delay(reserva.pk, codigo_otp)
        
        return JsonResponse({
            'success': True,
            'reserva_id': reserva.pk,
            'message': 'Reserva creada exitosamente'
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def api_verificar_otp(request, reserva_id):
    """API endpoint para verificar OTP"""
    try:
        data = json.loads(request.body)
        codigo_otp = data.get('codigo_otp')
        
        reserva = get_object_or_404(ReservaHabitacion, pk=reserva_id)
        
        if reserva.verificar_otp(codigo_otp):
            # Enviar ticket de confirmación
            enviar_ticket_confirmacion.delay(reserva.pk)
            
            return JsonResponse({
                'success': True,
                'message': 'Reserva confirmada exitosamente'
            })
        else:
            return JsonResponse({
                'success': False,
                'error': 'Código inválido o expirado'
            }, status=400)
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def api_reenviar_otp(request, reserva_id):
    """API endpoint para reenviar OTP"""
    try:
        reserva = get_object_or_404(ReservaHabitacion, pk=reserva_id)
        
        # Generar nuevo código
        codigo_otp = reserva.generar_otp()
        
        # Enviar nuevo email
        enviar_email_confirmacion.delay(reserva.pk, codigo_otp)
        
        return JsonResponse({
            'success': True,
            'message': 'Código reenviado exitosamente'
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)