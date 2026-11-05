import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ProductoFormComponent } from './producto-form/producto-form.component';
import { ProductoListComponent } from './producto-list/producto-list.component';

const routes: Routes = [
  { path: '', component: ProductoListComponent, title: 'Productos' },
  { path: 'nuevo', component: ProductoFormComponent, title: 'Nuevo producto' },
  { path: ':id/editar', component: ProductoFormComponent, title: 'Editar producto' },
];

@NgModule({
  declarations: [ProductoListComponent, ProductoFormComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class ProductosModule {}
