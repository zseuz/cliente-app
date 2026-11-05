import { pool, Queryable } from '../config/database';
import { offsetOf, PaginationQuery } from '../utils/pagination';

export interface Venta {
  id: number;
  vendedorId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  total: number;
  fecha: Date;
  observaciones: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Venta enriquecida con los datos mínimos de vendedor y producto para listados. */
export interface VentaDetalle extends Venta {
  vendedor: { id: number; nombre: string; apellido: string };
  producto: { id: number; codigo: string; nombre: string };
}

export interface VentaRow {
  vendedorId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  fecha?: Date;
  observaciones?: string | null;
}

export interface VentaFilters extends PaginationQuery {
  vendedorId?: number;
  productoId?: number;
  desde?: Date;
  hasta?: Date;
}

const SELECT_DETALLE = `
  SELECT v.id,
         v.vendedor_id     AS "vendedorId",
         v.producto_id     AS "productoId",
         v.cantidad,
         v.precio_unitario AS "precioUnitario",
         v.total,
         v.fecha,
         v.observaciones,
         v.created_at      AS "createdAt",
         v.updated_at      AS "updatedAt",
         json_build_object('id', ve.id, 'nombre', ve.nombre, 'apellido', ve.apellido) AS vendedor,
         json_build_object('id', p.id, 'codigo', p.codigo, 'nombre', p.nombre)        AS producto
    FROM venta v
    JOIN vendedor ve ON ve.id = v.vendedor_id
    JOIN producto p  ON p.id  = v.producto_id`;

const RETURNING = `
  id, vendedor_id AS "vendedorId", producto_id AS "productoId", cantidad,
  precio_unitario AS "precioUnitario", total, fecha, observaciones,
  created_at AS "createdAt", updated_at AS "updatedAt"`;

function buildWhere(f: VentaFilters): { where: string; params: unknown[] } {
  const clauses: string[] = [];
  const params: unknown[] = [];
  const add = (sql: string, value: unknown) => {
    params.push(value);
    clauses.push(sql.replace('?', `$${params.length}`));
  };
  if (f.vendedorId) add('v.vendedor_id = ?', f.vendedorId);
  if (f.productoId) add('v.producto_id = ?', f.productoId);
  if (f.desde) add('v.fecha >= ?', f.desde);
  if (f.hasta) add('v.fecha <= ?', f.hasta);
  if (f.search) {
    params.push(`%${f.search}%`);
    const i = `$${params.length}`;
    clauses.push(`(p.nombre ILIKE ${i} OR p.codigo ILIKE ${i} OR ve.nombre ILIKE ${i} OR ve.apellido ILIKE ${i})`);
  }
  return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params };
}

/** Capa de acceso a datos (Model) de la tabla venta. */
export const VentaModel = {
  async findAll(f: VentaFilters, db: Queryable = pool): Promise<{ rows: VentaDetalle[]; total: number; sumTotal: number }> {
    const { where, params } = buildWhere(f);
    const agg = await db.query<{ count: number; sum: number }>(
      `SELECT COUNT(*) AS count, COALESCE(SUM(v.total), 0) AS sum
         FROM venta v
         JOIN vendedor ve ON ve.id = v.vendedor_id
         JOIN producto p  ON p.id  = v.producto_id
        ${where}`,
      params,
    );
    const rows = await db.query<VentaDetalle>(
      `${SELECT_DETALLE} ${where}
       ORDER BY v.fecha DESC, v.id DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, f.limit, offsetOf(f)],
    );
    return { rows: rows.rows, total: agg.rows[0].count, sumTotal: agg.rows[0].sum };
  },

  async findById(id: number, db: Queryable = pool): Promise<VentaDetalle | null> {
    const { rows } = await db.query<VentaDetalle>(`${SELECT_DETALLE} WHERE v.id = $1`, [id]);
    return rows[0] ?? null;
  },

  /** Bloquea la fila de la venta (sin joins) para modificarla dentro de una transacción. */
  async lockById(id: number, db: Queryable): Promise<Venta | null> {
    const { rows } = await db.query<Venta>(`SELECT ${RETURNING} FROM venta WHERE id = $1 FOR UPDATE`, [id]);
    return rows[0] ?? null;
  },

  async create(data: VentaRow, db: Queryable = pool): Promise<Venta> {
    const { rows } = await db.query<Venta>(
      `INSERT INTO venta (vendedor_id, producto_id, cantidad, precio_unitario, fecha, observaciones)
       VALUES ($1, $2, $3, $4, COALESCE($5, NOW()), $6)
       RETURNING ${RETURNING}`,
      [data.vendedorId, data.productoId, data.cantidad, data.precioUnitario, data.fecha ?? null, data.observaciones ?? null],
    );
    return rows[0];
  },

  async update(id: number, data: VentaRow, db: Queryable = pool): Promise<Venta | null> {
    const { rows } = await db.query<Venta>(
      `UPDATE venta
          SET vendedor_id = $2, producto_id = $3, cantidad = $4, precio_unitario = $5,
              fecha = COALESCE($6, fecha), observaciones = $7
        WHERE id = $1
       RETURNING ${RETURNING}`,
      [id, data.vendedorId, data.productoId, data.cantidad, data.precioUnitario, data.fecha ?? null, data.observaciones ?? null],
    );
    return rows[0] ?? null;
  },

  async remove(id: number, db: Queryable = pool): Promise<boolean> {
    const { rowCount } = await db.query('DELETE FROM venta WHERE id = $1', [id]);
    return (rowCount ?? 0) > 0;
  },
};
