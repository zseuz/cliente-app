export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProductoSave = Pick<Producto, 'codigo' | 'nombre' | 'descripcion' | 'precio' | 'stock' | 'activo'>;
