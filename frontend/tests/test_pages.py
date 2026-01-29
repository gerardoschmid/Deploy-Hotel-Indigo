import pytest
from playwright.sync_api import Page, expect
import re

# --- Lista de todas las URLs estáticas a probar ---
# Pytest tomará esta lista y creará una prueba por cada elemento.
@pytest.mark.parametrize("page_url", [
    "/",                        # home
    "/nosotros/",               # nosotros
    "/acceso/",                 # acceso
    "/habitaciones/",           # habitaciones
    "/reservar/",               # reserva
    "/servicios/",              # servicios
    "/eventos/",                # eventos
    "/cotizar-evento/",         # reserva_eventos
    "/reservar-mesa/",          # reserva_restaurante
    "/restaurant/",             # restaurante
    "/menu/",                   # restaurante_menu
    "/galeria/",                # galeria
    "/contacto/",               # contacto
    "/trabaja-con-nosotros/",   # empleo
    # NOTA: Las URLs con parámetros (como detalle_habitacion) no pueden incluirse aquí.
])
def test_all_site_pages_load_successfully(page: Page, page_url):
    """
    Verifica la integridad de la carga para todas las páginas estáticas del sitio.
    
    Esta prueba se ejecuta en modo Cross-Browser y paralelo (gracias a pytest-xdist y parametrize).
    """
    print(f"\nProbando la URL: {page_url}")
    
    # 1. Navegar a la página
    # Playwright utiliza la 'base_url = http://127.0.0.1:8000' de tu pytest.ini
    page.goto(page_url)
    
    # 2. Verificar Título (Verificación de Carga Exitosa)
    # Usa 're.compile' para permitir que el título sea "Hotel Indigo | Lo que sea"
    expect(page).to_have_title(re.compile("Hotel Indigo"), timeout=10000)

    # 3. Verificar Contenido Mínimo (Verificación de Estructura)
    # Asegura que el cuerpo principal de la página existe y es visible.
    expect(page.locator("body")).to_be_visible()

    # 4. Verificar que no haya errores de servidor (opcional: revisa si hay un encabezado de éxito)
    # expect(page.locator("h1")).to_be_visible()