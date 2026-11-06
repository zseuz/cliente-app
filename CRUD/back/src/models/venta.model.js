const pool = require('../config/db');

// trae la venta con el nombre del vendedor y del producto
const SELECT_VENTAS = `
  SELECT v.id_venta, v.id_vendedor, v.id_producto, v.cantidad, v.total,
         TO_CHAR(v.fecha, 'YYYY-MM-DD') AS fecha,
         ve.nombre || ' ' || ve.apellido AS vendedor,
         p.nombre AS producto
  FROM venta v
  INNER JOIN vendedor ve ON ve.id_vendedor = v.id_vendedor
  INNER JOIN producto p ON p.id_producto = v.id_producto`;

const Venta = {
  async listar() {
    const res = await pool.query(SELECT_VENTAS + ' ORDER BY v.id_venta');
    return res.rows;
  },

  async buscarPorId(id) {
    const res = await pool.query(SELECT_VENTAS + ' WHERE v.id_venta = $1', [id]);
    return res.rows[0];
  },

  async crear({ id_vendedor, id_producto, cantidad, fecha }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const prod = await client.query('SELECT * FROM producto WHERE id_producto = $1 FOR UPDATE', [id_producto]);
      const producto = prod.rows[0];
      if (!producto) throw new Error('El producto no existe');
      if (producto.stock < cantidad) throw new Error('No hay stock suficiente, quedan ' + producto.stock);

      const total = producto.precio * cantidad;
      const res = await client.query(
        `INSERT INTO venta (id_vendedor, id_producto, cantidad, total, fecha)
         VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_DATE)) RETURNING id_venta`,
        [id_vendedor, id_producto, cantidad, total, fecha || null]
      );
      await client.query('UPDATE producto SET stock = stock - $1 WHERE id_producto = $2', [cantidad, id_producto]);

      await client.query('COMMIT');
      return res.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async actualizar(id, { id_vendedor, id_producto, cantidad, fecha }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const anterior = (await client.query('SELECT * FROM venta WHERE id_venta = $1', [id])).rows[0];
      if (!anterior) {
        await client.query('ROLLBACK');
        return null;
      }

      // primero se devuelve lo que se habia vendido y despues se descuenta lo nuevo
      await client.query('UPDATE producto SET stock = stock + $1 WHERE id_producto = $2', [anterior.cantidad, anterior.id_producto]);

      const producto = (await client.query('SELECT * FROM producto WHERE id_producto = $1 FOR UPDATE', [id_producto])).rows[0];
      if (!producto) throw new Error('El producto no existe');
      if (producto.stock < cantidad) throw new Error('No hay stock suficiente, quedan ' + producto.stock);

      const total = producto.precio * cantidad;
      await client.query(
        `UPDATE venta SET id_vendedor = $1, id_producto = $2, cantidad = $3, total = $4, fecha = COALESCE($5, fecha)
         WHERE id_venta = $6`,
        [id_vendedor, id_producto, cantidad, total, fecha || null, id]
      );
      await client.query('UPDATE producto SET stock = stock - $1 WHERE id_producto = $2', [cantidad, id_producto]);

      await client.query('COMMIT');
      return { id_venta: Number(id) };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async eliminar(id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const res = await client.query('DELETE FROM venta WHERE id_venta = $1 RETURNING *', [id]);
      const venta = res.rows[0];
      if (venta) {
        // al borrar la venta se regresa el stock
        await client.query('UPDATE producto SET stock = stock + $1 WHERE id_producto = $2', [venta.cantidad, venta.id_producto]);
      }
      await client.query('COMMIT');
      return res.rowCount;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
};

module.exports = Venta;
