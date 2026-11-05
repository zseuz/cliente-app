import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { VentaFormComponent } from './venta-form/venta-form.component';
import { VentaListComponent } from './venta-list/venta-list.component';

const routes: Routes = [
  { path: '', component: VentaListComponent, title: 'Ventas' },
  { path: 'nueva', component: VentaFormComponent, title: 'Registrar venta' },
  { path: ':id/editar', component: VentaFormComponent, title: 'Editar venta' },
];

@NgModule({
  declarations: [VentaListComponent, VentaFormComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class VentasModule {}
