import { Paginated } from '../core/models/paginated';

export interface Venta {
  id: number;
  vendedorId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  total: number;
  fecha: string;
  observaciones: string | null;
  createdAt: string;
  updatedAt: string;
  vendedor: { id: number; nombre: string; apellido: string };
  producto: { id: number; codigo: string; nombre: string };
}

/** El precio unitario NO se envía: lo fija el backend desde el producto. */
export interface VentaSave {
  vendedorId: number;
  productoId: number;
  cantidad: number;
  fecha?: string;
  observaciones: string | null;
}

export type VentaPage = Paginated<Venta> & { summary: { totalVendido: number } };
