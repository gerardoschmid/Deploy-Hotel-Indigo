@echo off
echo ========================================
echo INSTALACION DEL PROYECTO HOTEL INDIGO
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
pip install --upgrade pip
pip install -r requirements.txt

echo.
echo 5. Configurando variables de entorno...
if not exist .env (
    echo Creando archivo .env desde .env.example...
    copy .env.example .env
    echo Por favor, revisa y ajusta el archivo .env segun tu configuracion
)

echo.
echo 6. Aplicando migraciones...
python manage.py makemigrations
python manage.py migrate

echo.
echo 7. Creando superusuario (opcional)...
echo Presiona Enter para omitir o escribe 'si' para crear superusuario:
set /p crear_super=
if /i "%crear_super%"=="si" (
    python manage.py createsuperuser
)

echo.
echo 8. Instalando dependencias del frontend...
cd ..\frontend
npm install --audit fix

echo.
echo 9. Verificando seguridad del frontend...
npm audit

echo.
echo ========================================
echo INSTALACION COMPLETADA
echo ========================================
echo.
echo Para ejecutar el proyecto:
echo 1. Usa el script: ejecutar.bat
echo 2. O manualmente:
echo    - Backend: cd backend ^&^& venv\Scripts\activate ^&^& python manage.py runserver
echo    - Frontend: cd frontend ^&^& npm run dev
echo.
echo Accesos:
echo - Frontend: http://localhost:5173
echo - Backend API: http://127.0.0.1:8000
echo - Admin Django: http://127.0.0.1:8000/admin
echo.
pause