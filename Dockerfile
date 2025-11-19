# Imagen base de Node.js
FROM node:18-alpine

# Información del mantenedor
LABEL maintainer="BrutRanking Team"
LABEL description="Aplicación de ranking de limpieza de oficina"

# Crear directorio de la aplicación
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar el resto de la aplicación
COPY . .

# Crear directorios necesarios con permisos adecuados
RUN mkdir -p data uploads && \
    chmod -R 755 data uploads

# Exponer el puerto
EXPOSE 3000

# Variable de entorno para producción
ENV NODE_ENV=production
ENV PORT=3000

# Usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/ranking', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); })"

# Comando para iniciar la aplicación
CMD ["node", "server.js"]
