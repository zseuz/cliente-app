import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto';
import { API_URL } from './api';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private url = API_URL + '/productos';

  constructor(private http: HttpClient) {}

  listar(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.url);
  }

  obtener(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.url}/${id}`);
  }

  crear(data: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.url, data);
  }

  actualizar(id: number, data: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.url}/${id}`, data);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }
}
