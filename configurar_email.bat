@echo off
echo ========================================
echo   CONFIGURADOR DE EMAIL - HOTEL INDIGO
echo ========================================
echo.

cd /d "%~dp0backend"

echo Configurando email para el sistema de reservas...
echo.

echo Seleccione el tipo de configuracion:
echo 1. Gmail (recomendado)
echo 2. Outlook/Hotmail
echo 3. Modo consola (para pruebas)
echo.

set /p opcion="Ingrese su opcion (1-3): "

if "%opcion%"=="1" goto gmail
if "%opcion%"=="2" goto outlook
if "%opcion%"=="3" goto consola
goto error

:gmail
echo.
echo === CONFIGURACION GMAIL ===
echo.
set /p email="Ingrese su email de Gmail: "
set /p password="Ingrese su contraseña de aplicacion: "

echo # Configuracion de Email > .env
echo EMAIL_HOST=smtp.gmail.com >> .env
echo EMAIL_PORT=587 >> .env
echo EMAIL_HOST_USER=%email% >> .env
echo EMAIL_HOST_PASSWORD=%password% >> .env
echo. >> .env
echo # Para usar otros proveedores: >> .env
echo # Outlook/Hotmail: >> .env
echo # EMAIL_HOST=smtp-mail.outlook.com >> .env
echo # EMAIL_PORT=587 >> .env
echo. >> .env
echo # Yahoo: >> .env
echo # EMAIL_HOST=smtp.mail.yahoo.com >> .env
echo # EMAIL_PORT=587 >> .env

echo.
echo ✅ Configuracion Gmail guardada en .env
echo.
echo IMPORTANTE: Para Gmail necesitas:
echo 1. Activar verificacion en 2 pasos
echo 2. Generar una contraseña de aplicacion
echo 3. Usar esa contraseña (no la de tu cuenta)
echo.
goto test

:outlook
echo.
echo === CONFIGURACION OUTLOOK ===
echo.
set /p email="Ingrese su email de Outlook: "
set /p password="Ingrese su contraseña: "

echo # Configuracion de Email > .env
echo EMAIL_HOST=smtp-mail.outlook.com >> .env
echo EMAIL_PORT=587 >> .env
echo EMAIL_HOST_USER=%email% >> .env
echo EMAIL_HOST_PASSWORD=%password% >> .env

echo.
echo ✅ Configuracion Outlook guardada en .env
goto test

:consola
echo # Configuracion de Email > .env
echo EMAIL_BACKEND=console >> .env
echo EMAIL_HOST_USER=hotel@indigo.com >> .env

echo.
echo ✅ Configuracion de consola guardada en .env
echo Los emails se mostraran en la consola del servidor
goto test

:test
echo.
echo ¿Desea probar la configuracion de email? (s/n)
set /p test_email=""

if /i "%test_email%"=="s" (
    echo.
    echo Probando configuracion de email...
    python test_reservas_email.py
)

echo.
echo ========================================
echo   CONFIGURACION COMPLETADA
echo ========================================
echo.
echo Para iniciar el servidor:
echo   python manage.py runserver
echo.
echo Para probar reservas:
echo   python test_reservas_email.py
echo.
pause
goto end

:error
echo.
echo ❌ Opcion invalida. Ejecute el script nuevamente.
pause

:end