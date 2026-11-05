export interface Vendedor {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export type VendedorSave = Pick<Vendedor, 'nombre' | 'apellido' | 'email' | 'telefono' | 'activo'>;
