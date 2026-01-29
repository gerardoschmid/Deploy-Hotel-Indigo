@echo off
echo ========================================
echo INSTALACION COMPLETA - HOTEL INDIGO
echo ========================================

echo.
echo 1. Verificando Python...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python no esta instalado. Instala Python 3.8+ desde python.org
    pause
    exit /b 1
)

echo.
echo 2. Verificando Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado. Instala Node.js desde nodejs.org
    pause
    exit /b 1
)

echo.
echo 3. Creando entorno virtual para el backend...
cd backend
python -m venv venv
call venv\Scripts\activate.bat

echo.
echo 4. Instalando dependencias del backend...
pip install -r requirements.txt

echo.
echo 5. Aplicando migraciones...
python manage.py makemigrations
python manage.py migrate

echo.
echo 6. Creando superusuario (opcional)...
echo Presiona Enter para omitir o escribe 'si' para crear superusuario:
set /p crear_super=
if /i "%crear_super%"=="si" (
    python manage.py createsuperuser
)

echo.
echo 7. Instalando dependencias del frontend...
cd ..\frontend
npm install

echo.
echo ========================================
echo CONFIGURACION DE EMAIL PARA RESERVAS
echo ========================================
echo.
echo Para que funcionen las reservas, necesitas configurar el email.
echo.
set /p config_email="¿Quieres configurar el email ahora? (s/n): "
if /i "%config_email%"=="s" (
    cd ..
    call configurar_email.bat
)

echo.
echo ========================================
echo INSTALACION COMPLETADA
echo ========================================
echo.
echo PROXIMOS PASOS:
echo 1. Si no configuraste email, ejecuta: configurar_email.bat
echo 2. Para probar email: cd backend ^&^& python probar_email.py
echo 3. Para ejecutar el proyecto: ejecutar.bat
echo.
echo URLs importantes:
echo - Frontend: http://localhost:5173
echo - Backend API: http://127.0.0.1:8000
echo - Admin Django: http://127.0.0.1:8000/admin
echo.
pause