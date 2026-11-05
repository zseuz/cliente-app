import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ListParams, Paginated } from '../models/paginated';

/**
 * Servicio base genérico para recursos REST de la API de ventas.
 * Cada feature lo extiende indicando solo el recurso.
 *
 * @typeParam T     entidad que devuelve la API
 * @typeParam TSave payload de creación/actualización
 */
export abstract class CrudService<T extends { id: number }, TSave = Partial<T>> {
  protected readonly url: string;

  protected constructor(protected readonly http: HttpClient, resource: string) {
    this.url = `${environment.ventasApiUrl}/${resource}`;
  }

  list(params: ListParams = {}): Observable<Paginated<T>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') httpParams = httpParams.set(key, String(value));
    });
    return this.http.get<Paginated<T>>(this.url, { params: httpParams });
  }

  get(id: number): Observable<T> {
    return this.http.get<T>(`${this.url}/${id}`);
  }

  create(body: TSave): Observable<T> {
    return this.http.post<T>(this.url, body);
  }

  update(id: number, body: TSave): Observable<T> {
    return this.http.put<T>(`${this.url}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
