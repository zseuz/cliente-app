-- Ejecutar conectado a la base crud_ventas

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
