import { Injectable } from '@angular/core';
import { Cliente } from './cliente';
import { Region } from './region';
import { HttpClient, HttpRequest, HttpEvent } from '@angular/common/http';
import { map, catchError, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private urlEndPoint: string = 'http://localhost:8080/api/clientes';

  //private httpHeader = new HttpHeaders({ 'content-type': 'application/json' });

  constructor(private http: HttpClient, private router: Router) {}

  // private agregarAuthorizationHeader(){
  //   let token = this.authService.token;
  //   if(token != ""){
  //     return this.httpHeader.append('Authorization','Bearer'+token);
  //   }
  //   return this.httpHeader;
  // }

  getRegiones(): Observable<Region[]> {
    return this.http.get<Region[]>(this.urlEndPoint + '/regiones');
  }

  getClientes(page: number): Observable<Cliente[]> {
    // return of(CLIENTES);
    return this.http.get(this.urlEndPoint + '/page/' + page).pipe(
      tap((response: any) => {
        // console.log('ClienteService: tap1');
        (response.content as Cliente[]).forEach((cliente) => {
          //console.log(cliente.nombre);
        });
      }),
      map((response: any) => {
        (response.content as Cliente[]).map((cliente) => {
          cliente.nombre = cliente.nombre.toUpperCase();

          //let datePipe = new DatePipe('co');

          //cliente.createAt = datePipe.transform(cliente.createAt, 'fullDate')||" "; // fecha completa
          // cliente.createAt = datePipe.transform(cliente.createAt, 'EEEE dd, MMMM yyyy')||" "; // fecha implementando exacto el dia y mes
          // cliente.createAt = datePipe.transform(cliente.createAt, 'dd/MM/yyyy')||" "; //fecha normal
          //cliente.createAt =formatDate(cliente.createAt,'dd-MM-yyyy','en-US');
          return cliente;
        });
        return response;
      }),
      tap((response: any) => {
        //console.log('ClienteService: tap2');
        (response.content as Cliente[]).forEach((cliente) => {
          //console.log(cliente.nombre);
        });
      })
    );
  }
  create(cliente: Cliente): Observable<Cliente> {
    return this.http.post(this.urlEndPoint, cliente).pipe(
      map((response: any) => response.cliente as Cliente),
      catchError((e) => {
        if (e.status == 400) {
          return throwError(() => e);
        }
        if (e.error.mensaje) {
          console.error(e.error.mensaje);
        }
        return throwError(() => e);
      })
    );
  }

  getCliente(id: any): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.urlEndPoint}/${id}`).pipe(
      catchError((e) => {
        if (e.status != 401 && e.error.mensaje) {
          this.router.navigate(['/clientes']);
          console.error(e.error.mensaje);
        }
        return throwError(() => e);
      })
    );
  }
  update(cliente: Cliente): Observable<any> {
    return this.http
      .put<any>(`${this.urlEndPoint}/${cliente.id}`, cliente)
      .pipe(
        catchError((e) => {
          if (e.status == 400) {
            return throwError(() => e);
          }
          if(e.error.mensaje){
            console.error(e.error.mensaje);
          }
          return throwError(() => e);
        })
      );
  }
  delete(id: number): Observable<Cliente> {
    return this.http.delete<Cliente>(`${this.urlEndPoint}/${id}`).pipe(
      map((response: any) => response.cliente as Cliente),
      catchError((e) => {
        if (e.error.mensaje) {
          console.error(e.error.mensaje);
        }
        return throwError(() => e);
      })
    );
  }
  subirFoto(archivo: File, id: any): Observable<HttpEvent<any>> {
    let formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('id', id);

    // let httpHeaders = new HttpHeaders();
    // let token = this.authService.token;
    // if(token != ""){
    //  httpHeaders = httpHeaders.append('Authorization','Bearer'+token)
    // }

    const req = new HttpRequest(
      'POST',
      `${this.urlEndPoint}/upload`,
      formData,
      {
        reportProgress: true,
      }
    );
    return this.http.request(req);
  }
}
