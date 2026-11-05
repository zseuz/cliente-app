import { pool, Queryable } from '../config/database';
import { offsetOf, PaginationQuery } from '../utils/pagination';

export interface Vendedor {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type VendedorInput = Pick<Vendedor, 'nombre' | 'apellido' | 'email'> &
  Partial<Pick<Vendedor, 'telefono' | 'activo'>>;

const COLUMNS = `
  id, nombre, apellido, email, telefono, activo,
  created_at AS "createdAt", updated_at AS "updatedAt"`;

/** Capa de acceso a datos (Model) de la tabla vendedor. */
export const VendedorModel = {
  async findAll(q: PaginationQuery, db: Queryable = pool): Promise<{ rows: Vendedor[]; total: number }> {
    const params: unknown[] = [];
    let where = '';
    if (q.search) {
      params.push(`%${q.search}%`);
      where = `WHERE nombre ILIKE $1 OR apellido ILIKE $1 OR email ILIKE $1`;
    }
    const total = await db.query<{ count: number }>(`SELECT COUNT(*) AS count FROM vendedor ${where}`, params);
    const rows = await db.query<Vendedor>(
      `SELECT ${COLUMNS} FROM vendedor ${where}
       ORDER BY apellido, nombre, id
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, q.limit, offsetOf(q)],
    );
    return { rows: rows.rows, total: total.rows[0].count };
  },

  async findById(id: number, db: Queryable = pool, forUpdate = false): Promise<Vendedor | null> {
    const { rows } = await db.query<Vendedor>(
      `SELECT ${COLUMNS} FROM vendedor WHERE id = $1 ${forUpdate ? 'FOR UPDATE' : ''}`,
      [id],
    );
    return rows[0] ?? null;
  },

  async create(data: VendedorInput, db: Queryable = pool): Promise<Vendedor> {
    const { rows } = await db.query<Vendedor>(
      `INSERT INTO vendedor (nombre, apellido, email, telefono, activo)
       VALUES ($1, $2, $3, $4, COALESCE($5, TRUE))
       RETURNING ${COLUMNS}`,
      [data.nombre, data.apellido, data.email, data.telefono ?? null, data.activo ?? null],
    );
    return rows[0];
  },

  async update(id: number, data: VendedorInput, db: Queryable = pool): Promise<Vendedor | null> {
    const { rows } = await db.query<Vendedor>(
      `UPDATE vendedor
          SET nombre = $2, apellido = $3, email = $4, telefono = $5, activo = COALESCE($6, activo)
        WHERE id = $1
       RETURNING ${COLUMNS}`,
      [id, data.nombre, data.apellido, data.email, data.telefono ?? null, data.activo ?? null],
    );
    return rows[0] ?? null;
  },

  async remove(id: number, db: Queryable = pool): Promise<boolean> {
    const { rowCount } = await db.query('DELETE FROM vendedor WHERE id = $1', [id]);
    return (rowCount ?? 0) > 0;
  },
};
