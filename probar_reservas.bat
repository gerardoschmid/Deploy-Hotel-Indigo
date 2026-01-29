@echo off
echo ========================================
echo PROBANDO SISTEMA DE RESERVAS - HOTEL INDIGO
echo ========================================
echo.

echo 1. Iniciando backend...
cd backend
start "Backend Django" cmd /k "python manage.py runserver"

echo 2. Esperando 3 segundos...
timeout /t 3 /nobreak > nul

echo 3. Iniciando frontend...
cd ..\frontend
start "Frontend Django" cmd /k "python manage.py runserver 8001"

echo.
echo ========================================
echo SERVIDORES INICIADOS:
echo - Backend API: http://127.0.0.1:8000
echo - Frontend Web: http://127.0.0.1:8001
echo ========================================
echo.
echo INSTRUCCIONES PARA PROBAR:
echo 1. Ve a: http://127.0.0.1:8001/habitaciones/
echo 2. Haz clic en "Reservar Ahora"
echo 3. Llena el formulario con tus datos
echo 4. El codigo OTP aparecera en pantalla
echo 5. Ingresa el codigo para completar la reserva
echo.
echo Presiona cualquier tecla para cerrar...
pause > nul