# ============================================================================
# Sistema de Reportes Barriales — Imagen del backend (Node.js + Express + SQLite)
# Construir desde la RAÍZ del proyecto (donde están /backend y las 4 vistas frontend):
#   docker build -t reportes-barriales-backend .
# ============================================================================
FROM node:22-alpine

WORKDIR /app

# 1. Instalar dependencias del backend primero (aprovecha la cache de Docker)
COPY backend/package*.json ./
RUN npm ci --omit=dev

# 2. Copiar el código fuente del backend
COPY backend/ ./

# 3. Copiar el frontend estático (index.html, reportes.html, seguimiento.html,
#    administrador.html) al lugar donde app.js lo espera:
#    __dirname (src) + '../../frontend' => desde /app (= backend/), resuelve a /frontend
COPY frontend/ /frontend/

# 4. Crear carpetas de runtime con permisos correctos (uploads y sqlite)
RUN mkdir -p uploads src/database && chown -R node:node /app /frontend

USER node
ENV NODE_ENV=production
EXPOSE 3000

# 5. Healthcheck usando el endpoint /api/health que ya expone app.js
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "server.js"]
