# website/urls.py

from django.urls import path
from . import views

urlpatterns = [
    # Mapea la ruta raíz ('') a la función views.index 
    path('', views.index, name='home'), 
    # Mapea la ruta 'nosotros/' a la función views.nosotros
    path('nosotros/', views.nosotros, name='nosotros'),

    path('acceso/', views.acceso, name='acceso'),

    path('habitaciones/', views.habitaciones, name='habitaciones'),

    path('reservar/', views.reserva, name='reserva'),

    path('eventos/', views.eventos, name='eventos'),
    path('cotizar-evento/', views.reserva_eventos, name='reserva_eventos'),

    path('habitaciones/<int:habitacion_id>/', views.detalle_habitacion, name='detalle_habitacion'),
    path('servicios/', views.servicios, name='servicios'),

# website/urls.py
# ...
path('reservar-mesa/', views.reserva_restaurante, name='reserva_restaurante'),
path('restaurant/', views.restaurante, name='restaurante'), 
# ...

path('menu/', views.restaurante_menu, name='restaurante_menu'),

path('galeria/', views.galeria, name='galeria'),

path('contacto/', views.contacto, name='contacto'),

path('admin-panel/', views.admin_panel_base, name='admin_panel_base'),

path('trabaja-con-nosotros/', views.empleo, name='empleo'),

path('reservar/procesar/', views.procesar_reserva, name='procesar_reserva'),

]
path('reenviar-otp/', views.reenviar_otp, name='reenviar_otp'),