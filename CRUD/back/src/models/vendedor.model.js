const pool = require('../config/db');

const Vendedor = {
  async listar() {
    const res = await pool.query('SELECT * FROM vendedor ORDER BY id_vendedor');
    return res.rows;
  },

  async buscarPorId(id) {
    const res = await pool.query('SELECT * FROM vendedor WHERE id_vendedor = $1', [id]);
    return res.rows[0];
  },

  async crear({ nombre, apellido, correo, telefono }) {
    const res = await pool.query(
      'INSERT INTO vendedor (nombre, apellido, correo, telefono) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, apellido, correo, telefono]
    );
    return res.rows[0];
  },

  async actualizar(id, { nombre, apellido, correo, telefono }) {
    const res = await pool.query(
      `UPDATE vendedor SET nombre = $1, apellido = $2, correo = $3, telefono = $4
       WHERE id_vendedor = $5 RETURNING *`,
      [nombre, apellido, correo, telefono, id]
    );
    return res.rows[0];
  },

  async eliminar(id) {
    const res = await pool.query('DELETE FROM vendedor WHERE id_vendedor = $1', [id]);
    return res.rowCount;
  },
};

module.exports = Vendedor;
