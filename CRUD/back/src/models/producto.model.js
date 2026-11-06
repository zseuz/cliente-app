const pool = require('../config/db');

const Producto = {
  async listar() {
    const res = await pool.query('SELECT * FROM producto ORDER BY id_producto');
    return res.rows;
  },

  async buscarPorId(id) {
    const res = await pool.query('SELECT * FROM producto WHERE id_producto = $1', [id]);
    return res.rows[0];
  },

  async crear({ nombre, descripcion, precio, stock }) {
    const res = await pool.query(
      'INSERT INTO producto (nombre, descripcion, precio, stock) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, descripcion, precio, stock]
    );
    return res.rows[0];
  },

  async actualizar(id, { nombre, descripcion, precio, stock }) {
    const res = await pool.query(
      `UPDATE producto SET nombre = $1, descripcion = $2, precio = $3, stock = $4
       WHERE id_producto = $5 RETURNING *`,
      [nombre, descripcion, precio, stock, id]
    );
    return res.rows[0];
  },

  async eliminar(id) {
    const res = await pool.query('DELETE FROM producto WHERE id_producto = $1', [id]);
    return res.rowCount;
  },
};

module.exports = Producto;
