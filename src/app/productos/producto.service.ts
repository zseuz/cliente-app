import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CrudService } from '../core/services/crud.service';
import { Producto, ProductoSave } from './producto.model';

@Injectable({ providedIn: 'root' })
export class ProductoService extends CrudService<Producto, ProductoSave> {
  constructor(http: HttpClient) {
    super(http, 'productos');
  }
}
