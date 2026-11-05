import { pool, Queryable } from '../config/database';
import { offsetOf, PaginationQuery } from '../utils/pagination';

export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductoInput = Pick<Producto, 'codigo' | 'nombre' | 'precio' | 'stock'> &
  Partial<Pick<Producto, 'descripcion' | 'activo'>>;

const COLUMNS = `
  id, codigo, nombre, descripcion, precio, stock, activo,
  created_at AS "createdAt", updated_at AS "updatedAt"`;

/** Capa de acceso a datos (Model) de la tabla producto. */
export const ProductoModel = {
  async findAll(q: PaginationQuery, db: Queryable = pool): Promise<{ rows: Producto[]; total: number }> {
    const params: unknown[] = [];
    let where = '';
    if (q.search) {
      params.push(`%${q.search}%`);
      where = `WHERE codigo ILIKE $1 OR nombre ILIKE $1`;
    }
    const total = await db.query<{ count: number }>(`SELECT COUNT(*) AS count FROM producto ${where}`, params);
    const rows = await db.query<Producto>(
      `SELECT ${COLUMNS} FROM producto ${where}
       ORDER BY nombre, id
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, q.limit, offsetOf(q)],
    );
    return { rows: rows.rows, total: total.rows[0].count };
  },

  async findById(id: number, db: Queryable = pool, forUpdate = false): Promise<Producto | null> {
    const { rows } = await db.query<Producto>(
      `SELECT ${COLUMNS} FROM producto WHERE id = $1 ${forUpdate ? 'FOR UPDATE' : ''}`,
      [id],
    );
    return rows[0] ?? null;
  },

  async create(data: ProductoInput, db: Queryable = pool): Promise<Producto> {
    const { rows } = await db.query<Producto>(
      `INSERT INTO producto (codigo, nombre, descripcion, precio, stock, activo)
       VALUES (UPPER($1), $2, $3, $4, $5, COALESCE($6, TRUE))
       RETURNING ${COLUMNS}`,
      [data.codigo, data.nombre, data.descripcion ?? null, data.precio, data.stock, data.activo ?? null],
    );
    return rows[0];
  },

  async update(id: number, data: ProductoInput, db: Queryable = pool): Promise<Producto | null> {
    const { rows } = await db.query<Producto>(
      `UPDATE producto
          SET codigo = UPPER($2), nombre = $3, descripcion = $4, precio = $5, stock = $6,
              activo = COALESCE($7, activo)
        WHERE id = $1
       RETURNING ${COLUMNS}`,
      [id, data.codigo, data.nombre, data.descripcion ?? null, data.precio, data.stock, data.activo ?? null],
    );
    return rows[0] ?? null;
  },

  /** Ajusta el stock de forma atómica; `delta` negativo descuenta unidades. */
  async adjustStock(id: number, delta: number, db: Queryable = pool): Promise<void> {
    await db.query('UPDATE producto SET stock = stock + $2 WHERE id = $1', [id, delta]);
  },

  async remove(id: number, db: Queryable = pool): Promise<boolean> {
    const { rowCount } = await db.query('DELETE FROM producto WHERE id = $1', [id]);
    return (rowCount ?? 0) > 0;
  },
};
