#!/bin/bash
cd "$(dirname "$0")/backend" || exit 1

if [ ! -d node_modules ]; then
  echo "Instalando dependencias por primera vez, un momento..."
  npm install
fi

echo ""
echo "Iniciando el sistema..."
echo "No cierres esta ventana/terminal mientras uses la pagina."
echo ""

# Abrir el navegador automaticamente (funciona en Mac y en la mayoria de Linux)
( sleep 1.5 && (open http://localhost:3000 2>/dev/null || xdg-open http://localhost:3000 2>/dev/null) ) &

node server.js
