const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Solo se permiten imágenes!');
    }
  }
});

// Ruta del archivo de datos
const DATA_FILE = path.join(__dirname, 'data', 'ranking.json');

// Inicializar archivo de datos si no existe
function initDataFile() {
  if (!fs.existsSync('data')) {
    fs.mkdirSync('data');
  }
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      personas: [],
      incidencias: []
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
}

// Leer datos
function readData() {
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data);
}

// Guardar datos
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Inicializar
initDataFile();

// === ENDPOINTS API ===

// Obtener ranking completo
app.get('/api/ranking', (req, res) => {
  const data = readData();

  // Calcular puntos totales para cada persona
  const ranking = data.personas.map(persona => {
    const incidencias = data.incidencias.filter(i => i.personaId === persona.id);
    return {
      ...persona,
      puntos: incidencias.length,
      ultimaIncidencia: incidencias.length > 0 ? incidencias[incidencias.length - 1].fecha : null
    };
  });

  // Ordenar por puntos (descendente)
  ranking.sort((a, b) => b.puntos - a.puntos);

  res.json(ranking);
});

// Obtener detalles de una persona
app.get('/api/persona/:id', (req, res) => {
  const data = readData();
  const persona = data.personas.find(p => p.id === req.params.id);

  if (!persona) {
    return res.status(404).json({ error: 'Persona no encontrada' });
  }

  const incidencias = data.incidencias.filter(i => i.personaId === req.params.id);

  res.json({
    ...persona,
    puntos: incidencias.length,
    incidencias: incidencias
  });
});

// Obtener todas las personas
app.get('/api/personas', (req, res) => {
  const data = readData();
  res.json(data.personas);
});

// Añadir nueva persona
app.post('/api/personas', (req, res) => {
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre es requerido' });
  }

  const data = readData();

  // Verificar si ya existe
  if (data.personas.find(p => p.nombre.toLowerCase() === nombre.toLowerCase())) {
    return res.status(400).json({ error: 'Esta persona ya existe' });
  }

  const nuevaPersona = {
    id: Date.now().toString(),
    nombre: nombre,
    fechaCreacion: new Date().toISOString()
  };

  data.personas.push(nuevaPersona);
  saveData(data);

  res.status(201).json(nuevaPersona);
});

// Añadir incidencia (punto) a una persona
app.post('/api/incidencias', upload.single('foto'), (req, res) => {
  const { personaId, descripcion } = req.body;

  if (!personaId) {
    return res.status(400).json({ error: 'El ID de la persona es requerido' });
  }

  const data = readData();
  const persona = data.personas.find(p => p.id === personaId);

  if (!persona) {
    return res.status(404).json({ error: 'Persona no encontrada' });
  }

  const nuevaIncidencia = {
    id: Date.now().toString(),
    personaId: personaId,
    descripcion: descripcion || '',
    foto: req.file ? `/uploads/${req.file.filename}` : null,
    fecha: new Date().toISOString()
  };

  data.incidencias.push(nuevaIncidencia);
  saveData(data);

  res.status(201).json(nuevaIncidencia);
});

// Obtener todas las incidencias
app.get('/api/incidencias', (req, res) => {
  const data = readData();
  res.json(data.incidencias);
});

// Eliminar incidencia
app.delete('/api/incidencias/:id', (req, res) => {
  const data = readData();
  const index = data.incidencias.findIndex(i => i.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Incidencia no encontrada' });
  }

  // Eliminar foto si existe
  const incidencia = data.incidencias[index];
  if (incidencia.foto) {
    const fotoPath = path.join(__dirname, 'public', incidencia.foto);
    if (fs.existsSync(fotoPath)) {
      fs.unlinkSync(fotoPath);
    }
  }

  data.incidencias.splice(index, 1);
  saveData(data);

  res.json({ message: 'Incidencia eliminada' });
});

// Eliminar persona
app.delete('/api/personas/:id', (req, res) => {
  const data = readData();
  const index = data.personas.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Persona no encontrada' });
  }

  // Eliminar también todas sus incidencias
  data.incidencias = data.incidencias.filter(i => i.personaId !== req.params.id);
  data.personas.splice(index, 1);
  saveData(data);

  res.json({ message: 'Persona eliminada' });
});

// Crear directorio uploads si no existe
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Dashboard público: http://localhost:${PORT}`);
  console.log(`Panel de administración: http://localhost:${PORT}/admin.html`);
});
