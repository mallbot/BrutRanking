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
├── data/                  # Base de datos JSON
│   └── ranking.json       # Datos de personas e incidencias
├── uploads/               # Fotos de evidencia
├── public/                # Frontend
│   ├── index.html         # Dashboard público
│   ├── app.js             # Lógica del dashboard
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

- ✅ Diseño responsive (móvil, tablet, desktop)
- ✅ Actualización automática del dashboard
- ✅ Animaciones y transiciones suaves
- ✅ Sistema de notificaciones (toasts)
- ✅ Preview de imágenes antes de subir
- ✅ Podio visual tipo olimpiadas
- ✅ Interfaz intuitiva y colorida

## 🔒 Seguridad

- Validación de tipos de archivo (solo imágenes)
- Nombres únicos para archivos subidos
- Validación de datos en backend

## 🌐 Despliegue en producción

Para desplegar en un servidor:

1. Configura la variable de entorno `PORT` si es necesario:
```bash
PORT=8080 npm start
```

2. Para producción, considera usar PM2:
```bash
npm install -g pm2
pm2 start server.js --name brutranking
pm2 save
```

3. Asegúrate de que las carpetas `data/` y `uploads/` tengan permisos de escritura

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