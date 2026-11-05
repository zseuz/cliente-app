-- =========================================================
--  001_init.sql — Esquema base: vendedor, producto, venta
-- =========================================================

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------- VENDEDOR ----------
CREATE TABLE IF NOT EXISTS vendedor (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  apellido    VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL,
  telefono    VARCHAR(20),
  activo      BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_vendedor_email ON vendedor (LOWER(email));

CREATE TRIGGER trg_vendedor_updated_at
  BEFORE UPDATE ON vendedor
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------- PRODUCTO ----------
CREATE TABLE IF NOT EXISTS producto (
  id           SERIAL PRIMARY KEY,
  codigo       VARCHAR(30)    NOT NULL,
  nombre       VARCHAR(150)   NOT NULL,
  descripcion  TEXT,
  precio       NUMERIC(12, 2) NOT NULL CHECK (precio >= 0),
  stock        INTEGER        NOT NULL DEFAULT 0 CHECK (stock >= 0),
  activo       BOOLEAN        NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_producto_codigo ON producto (UPPER(codigo));

CREATE TRIGGER trg_producto_updated_at
  BEFORE UPDATE ON producto
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------- VENTA ----------
-- precio_unitario se congela al momento de la venta (histórico),
-- total es una columna generada para garantizar consistencia.
CREATE TABLE IF NOT EXISTS venta (
  id               SERIAL PRIMARY KEY,
  vendedor_id      INTEGER        NOT NULL REFERENCES vendedor (id) ON DELETE RESTRICT,
  producto_id      INTEGER        NOT NULL REFERENCES producto (id) ON DELETE RESTRICT,
  cantidad         INTEGER        NOT NULL CHECK (cantidad > 0),
  precio_unitario  NUMERIC(12, 2) NOT NULL CHECK (precio_unitario >= 0),
  total            NUMERIC(14, 2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
  fecha            TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  observaciones    VARCHAR(255),
  created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_venta_vendedor ON venta (vendedor_id);
CREATE INDEX IF NOT EXISTS ix_venta_producto ON venta (producto_id);
CREATE INDEX IF NOT EXISTS ix_venta_fecha    ON venta (fecha DESC);

CREATE TRIGGER trg_venta_updated_at
  BEFORE UPDATE ON venta
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
