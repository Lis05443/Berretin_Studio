@echo off
title Sistema de Reportes Barriales
cd /d "%~dp0backend"

if not exist node_modules (
    echo Instalando dependencias por primera vez, un momento...
    call npm install
)

echo.
echo Iniciando el sistema...
echo No cierres esta ventana mientras uses la pagina.
echo.

start "" http://localhost:3000
node server.js
pause
