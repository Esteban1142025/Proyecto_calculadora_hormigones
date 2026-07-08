const express = require('express');
const pool = require('../db');
const verificarToken = require('../middleware/auth');

const router = express.Router();
router.use(verificarToken); // todas las rutas requieren login

const CAMPOS_CONSULTA = [
  'nombre', 'fcr_type', 'fc', 's', 'data_count', 'fcr_input',
  'slump_cm', 'has_air', 'exposure', 'freeze_thaw',
  'pec', 'peaf', 'haf', 'absaf', 'mf',
  'peag', 'hag', 'absag', 'tmn', 'puc',
  'use_water_reducer', 'water_reduction_pct', 'use_pozzolan', 'pozzolan_replacement_pct', 'pe_pozzolan'
];

// GET /api/consultas — listar todas las consultas del usuario
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, created_at, updated_at FROM consultas WHERE usuario_id = $1 ORDER BY updated_at DESC',
      [req.usuario.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener consultas' });
  }
});

// GET /api/consultas/:id — cargar una consulta completa (para llenar la calculadora)
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM consultas WHERE id = $1 AND usuario_id = $2',
      [req.params.id, req.usuario.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Consulta no encontrada' });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener consulta' });
  }
});

// POST /api/consultas — guardar consulta nueva
router.post('/', async (req, res) => {
  const datos = req.body;

  const columnas = CAMPOS_CONSULTA.filter(c => datos[c] !== undefined);
  const valores = columnas.map(c => datos[c]);
  const placeholders = columnas.map((_, i) => `$${i + 2}`).join(', ');

  try {
    const result = await pool.query(
      `INSERT INTO consultas (usuario_id, ${columnas.join(', ')}) VALUES ($1, ${placeholders}) RETURNING *`,
      [req.usuario.id, ...valores]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar consulta' });
  }
});

// PUT /api/consultas/:id — actualizar consulta existente
router.put('/:id', async (req, res) => {
  const datos = req.body;

  const columnas = CAMPOS_CONSULTA.filter(c => datos[c] !== undefined);
  if (columnas.length === 0)
    return res.status(400).json({ error: 'No hay datos para actualizar' });

  const sets = columnas.map((c, i) => `${c} = $${i + 3}`).join(', ');
  const valores = columnas.map(c => datos[c]);

  try {
    const result = await pool.query(
      `UPDATE consultas SET ${sets} WHERE id = $1 AND usuario_id = $2 RETURNING *`,
      [req.params.id, req.usuario.id, ...valores]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Consulta no encontrada' });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar consulta' });
  }
});

// DELETE /api/consultas/:id — eliminar consulta
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM consultas WHERE id = $1 AND usuario_id = $2 RETURNING id',
      [req.params.id, req.usuario.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Consulta no encontrada' });

    res.json({ mensaje: 'Consulta eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar consulta' });
  }
});

module.exports = router;
