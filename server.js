// server.js
// 1) Importo Express (framework para crear servidor y rutas fácil)
const express = require('express');
// 2) Creo la app (instancia del servidor)
const app = express();
// 3) Puerto donde escuchará la app
const PORT = 3000;
// 4) Middlewares globales
// 4.a) Registrar en consola cada request (útil para ver qué llega)
app.use((req, res, next) => {
console.log(`${req.method} ${req.url}`);
next(); // sigue al próximo middleware o endpoint
});
// 4.b) Habilitar parseo de JSON en el body de POST/PUT
app.use(express.json());
// 4.c) Servir archivos estáticos de /public (para el HTML)
app.use(express.static('public'));
// 5) "Base de datos" en memoria (array)

// Nota: Se vacía cuando reiniciás el servidor (es para práctica)
let materias = [
{ id: 1, titulo: 'Matematica', hecho: false },
{ id: 2, titulo: 'Lengua', hecho: true },
{ id: 3, titulo: 'Fisica', hecho: true },
{ id: 4, titulo: 'Quimica', hecho: true },
{ id: 5, titulo: 'Ed.Fisica', hecho: true },

];
let nextId = 6; // auto-incremental simple
// 6) Helpers (funciones auxiliares)
/**
* Buscar una tarea por ID (convierte a número).
*/
function findById(id) {
return materias.find(t => t.id === Number(id));
}
/**
* Validar payload de tarea (solo pedimos "titulo" como string no vacío)
*/
function validarMateriaPayload(payload) {
return payload &&
typeof payload.titulo === 'string' &&
payload.titulo.trim().length > 0;
}
// 7) Endpoints CRUD (recurso: tareas)
// 7.1) READ - Listar todas
// GET /api/tareas
app.get('/api/materias', (req, res) => {
// Respondemos JSON con status 200 (OK por defecto)
res.json(materias);
});
// 7.2) READ - Obtener una por id
// GET /api/tareas/:id
app.get('/api/materias/:id', (req, res) => {
const materias = findById(req.params.id);
if (!materias) {
// Si no existe, 404 (no encontrado)
return res.status(404).json({ ok: false, error: 'Materia no encontrada' });
}
res.json(materias);
});
// 7.3) CREATE - Crear una nueva
// POST /api/tareas Body: { "titulo": "texto", "hecho": false? }
app.post('/api/materias', (req, res) => {
// Validación mínima

if (!validarMateriaPayload(req.body)) {
return res.status(400).json({ ok: false, error: 'El campo "titulo" es obligatorio' });
}
const nueva = {
id: nextId++,
titulo: req.body.titulo.trim(),
hecho: Boolean(req.body.hecho) // si viene, lo forzamos a boolean
};
materias.push(nueva);
// 201 = creado
res.status(201).json({ ok: true, data: nueva });
});
// 7.4) UPDATE - Reemplazar valores de una tarea existente
// PUT /api/tareas/:id Body: { "titulo": "texto", "hecho": true/false }
app.put('/api/materias/:id', (req, res) => {
const materias = findById(req.params.id);
if (!materias) {
return res.status(404).json({ ok: false, error: 'Materia no encontrada' });
}
if (!validarMateriaPayload(req.body)) {
return res.status(400).json({ ok: false, error: 'El campo "titulo" es obligatorio' });
}
// Actualizamos
materias.titulo = req.body.titulo.trim();
// Si no vino "hecho", lo dejamos como estaba. Si vino, lo convertimos a boolean.
if (typeof req.body.hecho !== 'undefined') {
materias.hecho = Boolean(req.body.hecho);
}
res.json({ ok: true, data: materias });
});
// 7.5) DELETE - Eliminar una tarea
// DELETE /api/tareas/:id
app.delete('/api/materias/:id', (req, res) => {
const id = Number(req.params.id);
const antes = materias.length;
materias = materias.filter(t => t.id !== id);
if (materias.length === antes) {
// No borró nada → no existía
return res.status(404).json({ ok: false, error: 'Materia no encontrada' });
}

// 204 = sin contenido (estándar cuando se borra)
res.status(204).send();
});
// 8) Fallback 404 para rutas inexistentes (después de todo)
app.use((req, res) => {
res.status(404).json({ ok: false, error: 'Ruta no encontrada' });
});
// 9) Levantar servidor
app.listen(PORT, () => {
console.log(`API escuchando en http://localhost:${PORT}`);
});