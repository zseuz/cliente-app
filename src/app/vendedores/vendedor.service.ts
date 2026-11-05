import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CrudService } from '../core/services/crud.service';
import { Vendedor, VendedorSave } from './vendedor.model';

@Injectable({ providedIn: 'root' })
export class VendedorService extends CrudService<Vendedor, VendedorSave> {
  constructor(http: HttpClient) {
    super(http, 'vendedores');
  }
}
