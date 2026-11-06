import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vendedor } from '../models/vendedor';
import { API_URL } from './api';

@Injectable({
  providedIn: 'root'
})
export class VendedorService {
  private url = API_URL + '/vendedores';

  constructor(private http: HttpClient) {}

  listar(): Observable<Vendedor[]> {
    return this.http.get<Vendedor[]>(this.url);
  }

  obtener(id: number): Observable<Vendedor> {
    return this.http.get<Vendedor>(`${this.url}/${id}`);
  }

  crear(data: Vendedor): Observable<Vendedor> {
    return this.http.post<Vendedor>(this.url, data);
  }

  actualizar(id: number, data: Vendedor): Observable<Vendedor> {
    return this.http.put<Vendedor>(`${this.url}/${id}`, data);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }
}
