require('dotenv').config();
const express = require('express');
const cors = require('cors');

const vendedorRoutes = require('./routes/vendedor.routes');
const productoRoutes = require('./routes/producto.routes');
const ventaRoutes = require('./routes/venta.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/vendedores', vendedorRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/ventas', ventaRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
