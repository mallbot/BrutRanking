#!/bin/bash

# Script para iniciar BrutRanking con Docker

echo "🧹 Iniciando BrutRanking con Docker..."

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker no está instalado"
    echo "Instala Docker desde: https://docs.docker.com/get-docker/"
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Error: Docker Compose no está instalado"
    echo "Instala Docker Compose desde: https://docs.docker.com/compose/install/"
    exit 1
fi

# Crear directorios si no existen
mkdir -p data uploads

# Detener contenedores existentes
echo "🛑 Deteniendo contenedores existentes..."
docker-compose down 2>/dev/null || docker compose down 2>/dev/null

# Construir y levantar el contenedor
echo "🔨 Construyendo imagen Docker..."
docker-compose build || docker compose build

echo "🚀 Iniciando contenedor..."
docker-compose up -d || docker compose up -d

# Esperar a que el servicio esté listo
echo "⏳ Esperando a que el servicio esté listo..."
sleep 5

# Verificar el estado
if docker-compose ps | grep -q "Up" || docker compose ps | grep -q "running"; then
    echo ""
    echo "✅ BrutRanking está corriendo!"
    echo ""
    echo "📱 Accede a:"
    echo "   Dashboard público:       http://localhost:3000"
    echo "   Panel de administración: http://localhost:3000/admin.html"
    echo ""
    echo "🔍 Ver logs:"
    echo "   docker-compose logs -f"
    echo ""
    echo "🛑 Detener:"
    echo "   docker-compose down"
else
    echo "❌ Error: El contenedor no se pudo iniciar correctamente"
    echo "Verifica los logs con: docker-compose logs"
    exit 1
fi
