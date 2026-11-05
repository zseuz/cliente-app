import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { VendedorFormComponent } from './vendedor-form/vendedor-form.component';
import { VendedorListComponent } from './vendedor-list/vendedor-list.component';

const routes: Routes = [
  { path: '', component: VendedorListComponent, title: 'Vendedores' },
  { path: 'nuevo', component: VendedorFormComponent, title: 'Nuevo vendedor' },
  { path: ':id/editar', component: VendedorFormComponent, title: 'Editar vendedor' },
];

@NgModule({
  declarations: [VendedorListComponent, VendedorFormComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class VendedoresModule {}
