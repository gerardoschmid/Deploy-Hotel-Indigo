from restaurante_mesa.models import RestauranteMesa
from salon_eventos.models import SalonEvento

mesas_data = [
    {"numero_mesa": "Mesa 1", "capacidad": 2},
    {"numero_mesa": "Mesa 2", "capacidad": 4},
    {"numero_mesa": "Mesa 3", "capacidad": 2},
    {"numero_mesa": "Mesa 4", "capacidad": 6},
    {"numero_mesa": "Mesa 5", "capacidad": 4},
    {"numero_mesa": "Mesa 6", "capacidad": 2},
    {"numero_mesa": "Mesa 7", "capacidad": 8},
    {"numero_mesa": "Mesa 8", "capacidad": 4},
    {"numero_mesa": "Mesa 9", "capacidad": 6},
    {"numero_mesa": "Mesa 10", "capacidad": 2},
]

salones_data = [
    {"nombre": "Salon Imperial", "descripcion": "Elegante y espacioso, perfecto para bodas de lujo"},
    {"nombre": "Salon Jardin", "descripcion": "Ambiente natural con vista a jardines tropicales"},
    {"nombre": "Salon Real", "descripcion": "Diseño clasico europeo con techos altos"},
    {"nombre": "Salon Terraza", "descripcion": "Espacio abierto con vista panoramica a la ciudad"},
    {"nombre": "Salon Diamante", "descripcion": "Moderno y minimalista con tecnologia audiovisual"},
    {"nombre": "Salon Primavera", "descripcion": "Decoracion floral y colores vibrantes"},
    {"nombre": "Salon Imperio", "descripcion": "Estilo imperial con columnas majestuosas"},
    {"nombre": "Salon Luna", "descripcion": "Iluminacion tenue y ambiente romantico"},
    {"nombre": "Salon Sol", "descripcion": "Espacio luminoso con grandes ventanales"},
    {"nombre": "Salon Estrella", "descripcion": "Techo retráctil con vista al cielo nocturno"},
]

for mesa_data in mesas_data:
    if not RestauranteMesa.objects.filter(numero_mesa=mesa_data["numero_mesa"]).exists():
        RestauranteMesa.objects.create(
            numero_mesa=mesa_data["numero_mesa"],
            capacidad=mesa_data["capacidad"]
        )

for salon_data in salones_data:
    if not SalonEvento.objects.filter(nombre=salon_data["nombre"]).exists():
        SalonEvento.objects.create(
            nombre=salon_data["nombre"],
            descripcion=salon_data["descripcion"]
        )

print("Datos creados exitosamente")
print(f"Mesas: {RestauranteMesa.objects.count()}")
print(f"Salones: {SalonEvento.objects.count()}")
