// Tienda DAW · aplicación de ejemplo para el módulo Despliegue de Aplicaciones Web
// Node.js + Express + MariaDB. Pensada para funcionar detrás de Nginx (proxy inverso).
require('dotenv').config();              // lee el archivo .env (configuración fuera del código)
const express = require('express');
const mariadb = require('mariadb');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';   // solo dentro de la máquina: la puerta es Nginx

const pool = mariadb.createPool({
  socketPath: process.env.DB_SOCKET || undefined,
  host: process.env.DB_SOCKET ? undefined : (process.env.DB_HOST || '127.0.0.1'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'tienda',
  connectionLimit: 5,
  acquireTimeout: 3000,
});

const app = express();
app.set('trust proxy', 'loopback');      // fíate de las cabeceras X-Forwarded-* que pone Nginx

const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Página principal: lista los productos y cuenta las visitas (lee y escribe en la base de datos)
app.get('/', async (req, res, next) => {
  try {
    await pool.query('UPDATE visitas SET total = total + 1 WHERE id = 1');
    const [{ total }] = await pool.query('SELECT total FROM visitas WHERE id = 1');
    const productos = await pool.query('SELECT nombre, precio FROM productos ORDER BY id');
    const filas = productos.map((p) => `<li>${esc(p.nombre)} · ${Number(p.precio).toFixed(2)} €</li>`).join('\n');
    res.send(`<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Tienda DAW</title></head>
<body>
<h1>Tienda DAW</h1>
<ul>
${filas}
</ul>
<p>Visitas: ${total}</p>
<p>Conexión desde: ${esc(req.socket.remoteAddress)} · Visitante: ${esc(req.ip)} · Protocolo: ${esc(req.protocol)}</p>
<p>Servido por Node.js ${process.version} · proceso ${process.pid}</p>
</body></html>
`);
  } catch (err) { next(err); }
});

// API: los productos en JSON
app.get('/api/productos', async (req, res, next) => {
  try {
    res.json(await pool.query('SELECT id, nombre, precio FROM productos ORDER BY id'));
  } catch (err) { next(err); }
});

// Comprobación de salud: ¿la aplicación llega a la base de datos?
app.get('/salud', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ estado: 'ok', bd: 'ok', pid: process.pid });
  } catch (err) {
    res.status(503).json({ estado: 'error', bd: 'sin conexión', detalle: err.code || err.message });
  }
});

// Cualquier error no previsto: 500 y el motivo al log (journalctl -u tienda-app)
app.use((err, req, res, next) => {
  console.error(`[error] ${req.method} ${req.originalUrl}: ${err.code || ''} ${err.message}`);
  res.status(500).send('Error interno de la aplicación\n');
});

app.listen(PORT, HOST, () => {
  console.log(`Tienda DAW escuchando en http://${HOST}:${PORT} (pid ${process.pid})`);
});
