-- Script completo: tablas + datos.
-- Antes crear la base con: CREATE DATABASE crud_ventas;
-- y ejecutar esto conectado a crud_ventas (sirve en pgAdmin o psql)

DROP TABLE IF EXISTS venta;
DROP TABLE IF EXISTS producto;
DROP TABLE IF EXISTS vendedor;

CREATE TABLE vendedor (
    id_vendedor  SERIAL PRIMARY KEY,
    nombre       VARCHAR(50)  NOT NULL,
    apellido     VARCHAR(50)  NOT NULL,
    correo       VARCHAR(100) NOT NULL UNIQUE,
    telefono     VARCHAR(20)
);

CREATE TABLE producto (
    id_producto  SERIAL PRIMARY KEY,
    nombre       VARCHAR(100)   NOT NULL,
    descripcion  VARCHAR(255),
    precio       NUMERIC(12,2)  NOT NULL CHECK (precio >= 0),
    stock        INTEGER        NOT NULL DEFAULT 0 CHECK (stock >= 0)
);

CREATE TABLE venta (
    id_venta     SERIAL PRIMARY KEY,
    id_vendedor  INTEGER       NOT NULL,
    id_producto  INTEGER       NOT NULL,
    cantidad     INTEGER       NOT NULL CHECK (cantidad > 0),
    total        NUMERIC(12,2) NOT NULL,
    fecha        DATE          NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT fk_venta_vendedor FOREIGN KEY (id_vendedor) REFERENCES vendedor (id_vendedor),
    CONSTRAINT fk_venta_producto FOREIGN KEY (id_producto) REFERENCES producto (id_producto)
);

-- Datos de prueba, 5 por tabla

INSERT INTO vendedor (nombre, apellido, correo, telefono) VALUES
('Laura',   'Gomez',     'laura.gomez@gmail.com',     '3001234567'),
('Carlos',  'Martinez',  'carlos.martinez@gmail.com', '3109876543'),
('Ana',     'Rodriguez', 'ana.rodriguez@gmail.com',   '3155551212'),
('Jorge',   'Herrera',   'jorge.herrera@gmail.com',   '3204447788'),
('Valeria', 'Castro',    'valeria.castro@gmail.com',  '3016662233');

INSERT INTO producto (nombre, descripcion, precio, stock) VALUES
('Portatil Lenovo',   'Ryzen 5, 16GB RAM, 512GB SSD', 2800000, 10),
('Monitor 24"',       'Monitor IPS Full HD',           650000, 20),
('Teclado mecanico',  'Teclado con switches rojos',    180000, 30),
('Mouse inalambrico', 'Mouse optico 1600 DPI',          60000, 40),
('Audifonos',         'Audifonos bluetooth',           150000, 25);

-- el total es cantidad * precio del producto
INSERT INTO venta (id_vendedor, id_producto, cantidad, total, fecha) VALUES
(1, 1, 2, 5600000, '2026-10-01'),
(2, 2, 3, 1950000, '2026-10-05'),
(3, 3, 1,  180000, '2026-10-12'),
(4, 4, 5,  300000, '2026-10-20'),
(5, 5, 2,  300000, '2026-10-28');

SELECT * FROM vendedor;
SELECT * FROM producto;
SELECT * FROM venta;
