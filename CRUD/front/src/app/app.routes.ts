import { Routes } from '@angular/router';
import { VendedoresComponent } from './components/vendedores/vendedores.component';
import { ProductosComponent } from './components/productos/productos.component';
import { VentasComponent } from './components/ventas/ventas.component';

export const routes: Routes = [
  { path: '', redirectTo: 'vendedores', pathMatch: 'full' },
  { path: 'vendedores', component: VendedoresComponent },
  { path: 'productos', component: ProductosComponent },
  { path: 'ventas', component: VentasComponent },
  { path: '**', redirectTo: 'vendedores' }
];
