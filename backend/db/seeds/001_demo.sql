-- Datos de ejemplo (idempotente)
INSERT INTO vendedor (nombre, apellido, email, telefono) VALUES
  ('Laura',  'Gómez',    'laura.gomez@empresa.com',   '3001234567'),
  ('Carlos', 'Martínez', 'carlos.martinez@empresa.com','3109876543'),
  ('Ana',    'Rodríguez','ana.rodriguez@empresa.com',  '3155551212')
ON CONFLICT DO NOTHING;

INSERT INTO producto (codigo, nombre, descripcion, precio, stock) VALUES
  ('LAP-001', 'Portátil 14"',      'Portátil 16GB RAM, 512GB SSD', 3200000, 15),
  ('MON-024', 'Monitor 24"',       'Monitor IPS Full HD',            650000, 30),
  ('TEC-101', 'Teclado mecánico',  'Switches rojos, layout ES',      280000, 50),
  ('MOU-055', 'Mouse inalámbrico', 'Sensor óptico 1600 DPI',          85000, 80)
ON CONFLICT DO NOTHING;
