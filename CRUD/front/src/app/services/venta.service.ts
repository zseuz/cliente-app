import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Venta } from '../models/venta';
import { API_URL } from './api';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private url = API_URL + '/ventas';

  constructor(private http: HttpClient) {}

  listar(): Observable<Venta[]> {
    return this.http.get<Venta[]>(this.url);
  }

  obtener(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.url}/${id}`);
  }

  crear(data: Venta): Observable<Venta> {
    return this.http.post<Venta>(this.url, data);
  }

  actualizar(id: number, data: Venta): Observable<Venta> {
    return this.http.put<Venta>(`${this.url}/${id}`, data);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }
}
