export interface Venta {
  id_venta?: number;
  id_vendedor: number | null;
  id_producto: number | null;
  cantidad: number;
  total?: number;
  fecha: string;
  // estos dos vienen del join en el back
  vendedor?: string;
  producto?: string;
}
