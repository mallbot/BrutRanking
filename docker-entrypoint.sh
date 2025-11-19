#!/bin/sh
set -e

# Script de entrada que ajusta permisos antes de iniciar la aplicación
# Se ejecuta como root para poder cambiar permisos, luego cambia a usuario nodejs

echo "🔧 Preparando entorno..."

# Crear directorios si no existen
mkdir -p /app/data /app/uploads

# Ajustar permisos para el usuario nodejs (UID 1001)
# Esto es necesario porque los volúmenes montados pueden venir con permisos del host
chown -R nodejs:nodejs /app/data /app/uploads 2>/dev/null || true
chmod -R 755 /app/data /app/uploads 2>/dev/null || true

echo "✓ Permisos ajustados"
echo "🚀 Iniciando aplicación como usuario nodejs..."

# Cambiar al usuario nodejs y ejecutar el comando principal
exec su-exec nodejs "$@"
