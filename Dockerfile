# Imagen base de Node.js
FROM node:18-alpine

# Información del mantenedor
LABEL maintainer="BrutRanking Team"
LABEL description="Aplicación de ranking de limpieza de oficina"

# Instalar su-exec para cambiar de usuario de forma segura
RUN apk add --no-cache su-exec

# Crear directorio de la aplicación
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
# Usar npm ci si existe package-lock.json, si no, npm install
RUN if [ -f package-lock.json ]; then \
        npm ci --omit=dev; \
    else \
        npm install --omit=dev; \
    fi && \
    npm cache clean --force

# Copiar el resto de la aplicación
COPY . .

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Copiar y dar permisos al script de entrypoint
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Exponer el puerto
EXPOSE 3000

# Variable de entorno para producción
ENV NODE_ENV=production
ENV PORT=3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/ranking', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); })"

# Configurar entrypoint (se ejecuta como root para ajustar permisos)
ENTRYPOINT ["docker-entrypoint.sh"]

# Comando para iniciar la aplicación (será ejecutado por el entrypoint como nodejs)
CMD ["node", "server.js"]
