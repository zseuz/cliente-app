const Vendedor = require('../models/vendedor.model');

const validar = (body) => {
  if (!body.nombre || !body.apellido || !body.correo) {
    return 'Nombre, apellido y correo son obligatorios';
  }
  return null;
};

const listar = async (req, res) => {
  try {
    const vendedores = await Vendedor.listar();
    res.json(vendedores);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar los vendedores', error: error.message });
  }
};

const obtener = async (req, res) => {
  try {
    const vendedor = await Vendedor.buscarPorId(req.params.id);
    if (!vendedor) return res.status(404).json({ mensaje: 'Vendedor no encontrado' });
    res.json(vendedor);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al buscar el vendedor', error: error.message });
  }
};

const crear = async (req, res) => {
  const error = validar(req.body);
  if (error) return res.status(400).json({ mensaje: error });

  try {
    const vendedor = await Vendedor.crear(req.body);
    res.status(201).json(vendedor);
  } catch (error) {
    if (error.code === '23505') return res.status(400).json({ mensaje: 'Ya existe un vendedor con ese correo' });
    res.status(500).json({ mensaje: 'Error al crear el vendedor', error: error.message });
  }
};

const actualizar = async (req, res) => {
  const error = validar(req.body);
  if (error) return res.status(400).json({ mensaje: error });

  try {
    const vendedor = await Vendedor.actualizar(req.params.id, req.body);
    if (!vendedor) return res.status(404).json({ mensaje: 'Vendedor no encontrado' });
    res.json(vendedor);
  } catch (error) {
    if (error.code === '23505') return res.status(400).json({ mensaje: 'Ya existe un vendedor con ese correo' });
    res.status(500).json({ mensaje: 'Error al actualizar el vendedor', error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const filas = await Vendedor.eliminar(req.params.id);
    if (!filas) return res.status(404).json({ mensaje: 'Vendedor no encontrado' });
    res.json({ mensaje: 'Vendedor eliminado' });
  } catch (error) {
    // 23503 = tiene ventas asociadas (llave foranea)
    if (error.code === '23503') return res.status(400).json({ mensaje: 'No se puede eliminar, el vendedor tiene ventas' });
    res.status(500).json({ mensaje: 'Error al eliminar el vendedor', error: error.message });
  }
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
