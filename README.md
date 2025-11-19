# 🧹 BrutRanking

Aplicación web para gestionar un ranking de limpieza en la oficina. Sistema gamificado para incentivar la limpieza en espacios compartidos como cocinas o salas comunes.

## 📋 Descripción

BrutRanking es una aplicación web completa que permite llevar un seguimiento de las incidencias de limpieza en la oficina. Cada vez que alguien deja suciedad sin limpiar, se le suma un punto al ranking junto con una foto de evidencia.

La aplicación incluye:
- **Dashboard público**: Pantalla para mostrar en videowalls o pantallas comunes
- **Panel de administración**: Interfaz para que los operadores gestionen el ranking
- **Sistema de evidencias fotográficas**: Cada incidencia incluye una foto

## 🚀 Instalación

### Prerrequisitos
- Node.js (versión 14 o superior)
- npm

### Pasos de instalación

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd BrutRanking
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar el servidor:
```bash
npm start
```

4. Abrir en el navegador:
- Dashboard público: `http://localhost:3000`
- Panel de administración: `http://localhost:3000/admin.html`

### 🐳 Instalación con Docker (Recomendado)

Docker facilita el despliegue y asegura que la aplicación funcione en cualquier entorno.

#### Prerrequisitos
- Docker (versión 20.10 o superior)
- Docker Compose (versión 2.0 o superior)

#### ⚠️ IMPORTANTE: Configuración segura para servidores con múltiples contenedores

Si tienes otros contenedores en producción que NO pueden caer:

```bash
# 1. Copia y configura el archivo .env
cp .env.example .env

# 2. Edita .env y cambia los valores según tu entorno
nano .env  # o vim .env

# IMPORTANTE: Verifica especialmente:
# - HOST_PORT: Usa un puerto que NO esté ocupado
# - CONTAINER_NAME: Usa un nombre único
# - NETWORK_NAME: Evita conflictos con redes existentes
```

**Valores recomendados para .env:**
```bash
HOST_PORT=3001          # Verifica: netstat -tuln | grep :3001
CONTAINER_NAME=brutranking-app-prod
NETWORK_NAME=brutranking-prod-network
DATA_PATH=/opt/brutranking/data
UPLOADS_PATH=/opt/brutranking/uploads
```

#### ✅ Opción 1: Script automático con verificaciones (RECOMENDADO)

Este script incluye verificaciones de seguridad:

```bash
# Primero, verifica que sea seguro desplegar
./check-safe-deploy.sh

# Si todo OK, despliega
./docker-start.sh
```

El script automáticamente:
- ✓ Verifica puertos disponibles
- ✓ Detecta conflictos de nombres
- ✓ Muestra otros contenedores corriendo
- ✓ Solo afecta a BrutRanking, NUNCA a otros contenedores
- ✓ Crea .env si no existe

#### Opción 2: Comandos manuales

```bash
# Construir y levantar el contenedor
docker-compose up -d

# Ver los logs
docker-compose logs -f

# Detener el contenedor
docker-compose down
```

#### Opción 3: Solo Docker (sin docker-compose)

```bash
# Construir la imagen
docker build -t brutranking:latest .

# Crear directorios para persistencia
mkdir -p data uploads

# Ejecutar el contenedor
docker run -d \
  --name brutranking \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/uploads:/app/uploads \
  --restart unless-stopped \
  brutranking:latest

# Ver logs
docker logs -f brutranking

# Detener
docker stop brutranking
docker rm brutranking
```

#### Verificar el estado

```bash
# Ver contenedores corriendo
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar el servicio
docker-compose restart

# Ver uso de recursos
docker stats brutranking-app
```

#### Configuración de puertos

Para usar un puerto diferente al 3000, edita el `docker-compose.yml`:

```yaml
ports:
  - "8080:3000"  # Puerto_host:Puerto_contenedor
```

O con Docker directo:

```bash
docker run -d -p 8080:3000 ...
```

## 📱 Uso

### Dashboard Público

El dashboard se actualiza automáticamente cada 10 segundos y muestra:
- **Podio**: Los 3 primeros puestos destacados con medallas
- **Ranking completo**: Lista ordenada por número de puntos
- **Última actualización**: Timestamp de la última sincronización

Ideal para mostrar en pantallas grandes o videowalls en áreas comunes.

### Panel de Administración

Accede a `http://localhost:3000/admin.html` para:

#### ➕ Añadir personas
1. Introduce el nombre de la persona
2. Clic en "Añadir Persona"

#### 📸 Registrar incidencias
1. Selecciona la persona del desplegable
2. Opcionalmente añade una descripción
3. Sube una foto de evidencia
4. Clic en "Registrar Incidencia"

#### 📊 Ver estadísticas
- Ranking actualizado en tiempo real
- Historial de incidencias recientes
- Fecha de última incidencia por persona

#### 🗑️ Gestión
- Eliminar incidencias (por error)
- Eliminar personas (elimina también todas sus incidencias)

## 🛠️ Tecnologías utilizadas

### Backend
- **Node.js**: Runtime de JavaScript
- **Express**: Framework web
- **Multer**: Manejo de subida de archivos
- **CORS**: Habilitar peticiones cross-origin

### Frontend
- **HTML5**: Estructura
- **CSS3**: Estilos y animaciones
- **JavaScript vanilla**: Lógica de la aplicación

### Almacenamiento
- **JSON**: Base de datos en archivo
- **File System**: Almacenamiento de imágenes

## 📁 Estructura del proyecto

```
BrutRanking/
├── server.js              # Servidor Express y API REST
├── package.json           # Dependencias del proyecto
├── Dockerfile             # Imagen Docker
├── docker-compose.yml     # Orquestación de contenedores
├── .dockerignore          # Archivos excluidos del build
├── docker-start.sh        # Script de inicio con Docker
├── data/                  # Base de datos JSON
│   └── ranking.json       # Datos de personas e incidencias
├── uploads/               # Fotos de evidencia
├── public/                # Frontend
│   ├── index.html         # Dashboard público
│   ├── app.js             # Lógica del dashboard
│   ├── background-3d.js   # Fondo 3D animado
│   ├── admin.html         # Panel de administración
│   ├── admin.js           # Lógica del panel admin
│   └── styles.css         # Estilos globales
└── README.md              # Este archivo
```

## 🔌 API Endpoints

### Personas
- `GET /api/personas` - Obtener todas las personas
- `POST /api/personas` - Añadir nueva persona
- `DELETE /api/personas/:id` - Eliminar persona

### Ranking
- `GET /api/ranking` - Obtener ranking ordenado
- `GET /api/persona/:id` - Obtener detalles de una persona

### Incidencias
- `GET /api/incidencias` - Obtener todas las incidencias
- `POST /api/incidencias` - Registrar nueva incidencia (con foto)
- `DELETE /api/incidencias/:id` - Eliminar incidencia

## 🎨 Características

### 🎭 Interfaz y Diseño
- ✅ Diseño 3D espectacular con tema escatológico
- ✅ Fondo animado con partículas y efectos 3D
- ✅ Título con efecto arcoíris y sombras 3D
- ✅ Efectos de slime goteando
- ✅ Podio visual tipo olimpiadas con animaciones
- ✅ Diseño responsive (móvil, tablet, desktop)
- ✅ Animaciones y transiciones suaves
- ✅ Burbujas tóxicas y partículas flotantes

### ⚡ Funcionalidades
- ✅ Actualización automática del dashboard (cada 10s)
- ✅ Sistema de notificaciones (toasts)
- ✅ Preview de imágenes antes de subir
- ✅ Interfaz intuitiva y colorida
- ✅ Historial de incidencias con fotos
- ✅ Sistema de ranking en tiempo real

### 🐳 Docker
- ✅ Dockerizado y listo para producción
- ✅ Docker Compose para despliegue fácil
- ✅ Volúmenes para persistencia de datos
- ✅ Healthcheck automático
- ✅ Usuario no-root para seguridad
- ✅ Script de inicio automático
- ✅ Reinicio automático en caso de fallo

## 🔒 Seguridad

### Seguridad de la aplicación
- Validación de tipos de archivo (solo imágenes)
- Nombres únicos para archivos subidos
- Validación de datos en backend
- Usuario no-root en contenedor Docker
- Imagen Alpine Linux (ligera y segura)

### ⚠️ Seguridad en entornos con múltiples contenedores

**CRÍTICO**: Si tienes otros contenedores en producción, sigue estos pasos:

#### 1. Usa el archivo .env para configuración
```bash
cp .env.example .env
nano .env  # Configura puertos y nombres únicos
```

#### 2. Verifica antes de desplegar
```bash
./check-safe-deploy.sh  # Detecta conflictos
```

El script de verificación comprueba:
- ✓ Puertos disponibles (evita colisiones)
- ✓ Nombres de contenedores (evita conflictos)
- ✓ Espacio en disco
- ✓ Otros contenedores corriendo
- ✓ Redes Docker

#### 3. Despliegue seguro garantizado

Los scripts están diseñados para:
- **NUNCA afectar otros contenedores**: Solo opera sobre BrutRanking
- **Detección de conflictos**: Avisa antes de cualquier problema
- **Límites de recursos**: CPU y RAM limitados para no monopolizar
- **Aislamiento de red**: Red bridge dedicada
- **Rollback automático**: Si falla, no deja el sistema en mal estado

#### 4. Comandos seguros

```bash
# Ver SOLO el contenedor de BrutRanking
docker ps --filter name=brutranking-app

# Detener SOLO BrutRanking (no afecta otros)
docker-compose down

# Ver logs SOLO de BrutRanking
docker logs brutranking-app

# Verificar recursos usados
docker stats brutranking-app
```

#### 5. Limitación de recursos

El contenedor está limitado a:
- **CPU**: Máximo 1 core (mínimo 0.25)
- **RAM**: Máximo 512MB (mínimo 128MB)

Esto previene que monopolice recursos del servidor.

#### 6. Cambiar puerto si hay conflicto

Si el puerto 3000 está ocupado:

```bash
# En .env
HOST_PORT=3001  # O cualquier puerto libre

# Verificar que esté libre
netstat -tuln | grep :3001
# Si no devuelve nada, está libre
```

## 🌐 Despliegue en producción

### 🐳 Despliegue con Docker (Recomendado)

Docker es la forma más sencilla y confiable de desplegar en producción.

#### En un servidor Linux

```bash
# 1. Instalar Docker y Docker Compose (si no están instalados)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 2. Clonar el repositorio
git clone <url-del-repositorio>
cd BrutRanking

# 3. Levantar el servicio
docker-compose up -d

# 4. Verificar que está corriendo
docker-compose ps
docker-compose logs -f
```

#### Con proxy reverso (Nginx)

Para usar con un dominio y HTTPS:

```nginx
# /etc/nginx/sites-available/brutranking
server {
    listen 80;
    server_name ranking.tuempresa.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Luego añade SSL con Let's Encrypt:

```bash
sudo certbot --nginx -d ranking.tuempresa.com
```

#### Actualizar la aplicación

```bash
# Detener el contenedor
docker-compose down

# Obtener última versión
git pull

# Reconstruir y reiniciar
docker-compose up -d --build

# Verificar logs
docker-compose logs -f
```

#### Backup de datos

```bash
# Crear backup
tar -czf backup-$(date +%Y%m%d).tar.gz data/ uploads/

# Restaurar backup
tar -xzf backup-20240101.tar.gz
```

### 📦 Despliegue tradicional (sin Docker)

Si prefieres no usar Docker:

1. Configura la variable de entorno `PORT` si es necesario:
```bash
PORT=8080 npm start
```

2. Para producción, considera usar PM2:
```bash
npm install -g pm2
pm2 start server.js --name brutranking
pm2 save
pm2 startup  # Configurar inicio automático
```

3. Asegúrate de que las carpetas `data/` y `uploads/` tengan permisos de escritura

### ☁️ Despliegue en la nube

#### Docker Hub

```bash
# Login en Docker Hub
docker login

# Tag y push
docker tag brutranking:latest tu-usuario/brutranking:latest
docker push tu-usuario/brutranking:latest
```

#### En cualquier VPS con Docker

```bash
# En el servidor
docker pull tu-usuario/brutranking:latest
docker run -d -p 3000:3000 \
  -v /opt/brutranking/data:/app/data \
  -v /opt/brutranking/uploads:/app/uploads \
  --restart always \
  tu-usuario/brutranking:latest
```

## 📝 Notas

- Los datos se guardan en `data/ranking.json`
- Las fotos se almacenan en `uploads/`
- El dashboard público se actualiza automáticamente cada 10 segundos
- El panel de admin se actualiza cada 30 segundos

## 🤝 Contribuir

Este es un proyecto interno de oficina. Para añadir funcionalidades:
1. Haz un fork del repositorio
2. Crea una rama para tu feature
3. Haz commit de tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

MIT License

---

**¡Mantengamos la oficina limpia! 🧹✨**