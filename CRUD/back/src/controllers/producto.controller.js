const Producto = require('../models/producto.model');

const validar = (body) => {
  if (!body.nombre) return 'El nombre es obligatorio';
  if (body.precio === undefined || body.precio === null || body.precio < 0) return 'El precio no es valido';
  if (body.stock === undefined || body.stock === null || body.stock < 0) return 'El stock no es valido';
  return null;
};

const listar = async (req, res) => {
  try {
    const productos = await Producto.listar();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar los productos', error: error.message });
  }
};

const obtener = async (req, res) => {
  try {
    const producto = await Producto.buscarPorId(req.params.id);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al buscar el producto', error: error.message });
  }
};

const crear = async (req, res) => {
  const error = validar(req.body);
  if (error) return res.status(400).json({ mensaje: error });

  try {
    const producto = await Producto.crear(req.body);
    res.status(201).json(producto);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear el producto', error: error.message });
  }
};

const actualizar = async (req, res) => {
  const error = validar(req.body);
  if (error) return res.status(400).json({ mensaje: error });

  try {
    const producto = await Producto.actualizar(req.params.id, req.body);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el producto', error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const filas = await Producto.eliminar(req.params.id);
    if (!filas) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json({ mensaje: 'Producto eliminado' });
  } catch (error) {
    if (error.code === '23503') return res.status(400).json({ mensaje: 'No se puede eliminar, el producto tiene ventas' });
    res.status(500).json({ mensaje: 'Error al eliminar el producto', error: error.message });
  }
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
