const Venta = require('../models/venta.model');

const validar = (body) => {
  if (!body.id_vendedor || !body.id_producto) return 'Debe seleccionar vendedor y producto';
  if (!body.cantidad || body.cantidad <= 0) return 'La cantidad debe ser mayor a 0';
  return null;
};

const listar = async (req, res) => {
  try {
    const ventas = await Venta.listar();
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar las ventas', error: error.message });
  }
};

const obtener = async (req, res) => {
  try {
    const venta = await Venta.buscarPorId(req.params.id);
    if (!venta) return res.status(404).json({ mensaje: 'Venta no encontrada' });
    res.json(venta);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al buscar la venta', error: error.message });
  }
};

const crear = async (req, res) => {
  const error = validar(req.body);
  if (error) return res.status(400).json({ mensaje: error });

  try {
    const { id_venta } = await Venta.crear(req.body);
    res.status(201).json(await Venta.buscarPorId(id_venta));
  } catch (error) {
    if (error.code === '23503') return res.status(400).json({ mensaje: 'El vendedor no existe' });
    res.status(400).json({ mensaje: error.message });
  }
};

const actualizar = async (req, res) => {
  const error = validar(req.body);
  if (error) return res.status(400).json({ mensaje: error });

  try {
    const venta = await Venta.actualizar(req.params.id, req.body);
    if (!venta) return res.status(404).json({ mensaje: 'Venta no encontrada' });
    res.json(await Venta.buscarPorId(req.params.id));
  } catch (error) {
    if (error.code === '23503') return res.status(400).json({ mensaje: 'El vendedor no existe' });
    res.status(400).json({ mensaje: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const filas = await Venta.eliminar(req.params.id);
    if (!filas) return res.status(404).json({ mensaje: 'Venta no encontrada' });
    res.json({ mensaje: 'Venta eliminada' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar la venta', error: error.message });
  }
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
