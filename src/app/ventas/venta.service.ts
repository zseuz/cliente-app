import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ListParams } from '../core/models/paginated';
import { CrudService } from '../core/services/crud.service';
import { Venta, VentaPage, VentaSave } from './venta.model';

@Injectable({ providedIn: 'root' })
export class VentaService extends CrudService<Venta, VentaSave> {
  constructor(http: HttpClient) {
    super(http, 'ventas');
  }

  /** El listado de ventas incluye además el total vendido según los filtros. */
  override list(params: ListParams = {}): Observable<VentaPage> {
    return super.list(params) as Observable<VentaPage>;
  }
}
