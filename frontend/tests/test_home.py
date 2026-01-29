import re
from playwright.sync_api import Page, expect

# Definición de la URL base para claridad (Aunque pytest.ini ya lo tiene)
URL_HOTEL = "/" 

def test_home_carga_correctamente(page: Page):
    """
    Prueba que la home cargue y verifica elementos críticos según el dispositivo (responsividad).
    Esta prueba se ejecuta en cada navegador individualmente (3 veces).
    """
    
    # 1. Navegar a la página principal
    page.goto(URL_HOTEL)

    # 2. Verificar Título (Asegura que la página cargó y no es un error 404/500)
    # Usamos 're.compile' para verificar que contiene "Hotel Indigo"
    expect(page).to_have_title(re.compile("Hotel Indigo"), timeout=5000)

    # 3. Visibilidad de Elementos Críticos (Widget de Reservas)
    # Busca el botón de reserva usando el texto real en tu HTML ("Reserva Ahora" o "Reservar Ahora").
    expect(page.get_by_role("button", name=re.compile("Reserva Ahora|Reservar Ahora"))).to_be_visible() 
    
    # 4. Lógica Responsiva MEJORADA (Verificación del Viewport)
    viewport_size = page.viewport_size
    # Obtiene el ancho del navegador actual (será diferente en móvil, tablet y escritorio)
    width = viewport_size['width'] if viewport_size else 1280 

    if width < 600:
        # Modo MÓVIL:
        print("--> Modo MÓVIL: Verificando elementos móviles.")
        # CORRECCIÓN: El selector real del botón hamburguesa es ".menu-toggle".
        expect(page.locator(".menu-toggle")).to_be_visible()
        # Verifica que la navegación de escritorio (".nav-wrapper") esté oculta.
        expect(page.locator(".nav-wrapper")).not_to_be_visible() 
    else:
        # Modo ESCRITORIO/TABLET:
        print("--> Modo ESCRITORIO: Verificando navegación completa.")
        # Verificamos que la navegación (el contenedor ".nav-wrapper") sea visible.
        expect(page.locator(".nav-wrapper")).to_be_visible() 
        # Verificamos que el botón móvil ("menu-toggle") esté oculto.
        expect(page.locator(".menu-toggle")).not_to_be_visible()