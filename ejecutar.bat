@echo off
echo ========================================
echo EJECUTANDO PROYECTO HOTEL INDIGO
echo ========================================

echo Iniciando servidores...
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo.

start "Backend Django" cmd /k "cd backend && venv\Scripts\activate && python manage.py runserver"
start "Frontend React" cmd /k "cd frontend && npm run dev"

echo Servidores iniciados en ventanas separadas.
echo Presiona cualquier tecla para cerrar este script...
pause > nul