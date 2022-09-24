import { Cliente } from './cliente';
import { ClienteService } from './cliente.service';

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import Swal from 'sweetalert2';
import { Region } from './region';
//import { Observable } from 'rxjs';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
})
export class FormComponent implements OnInit {
  public cliente: Cliente = new Cliente();
  public regiones: Region[];
  public titulo: string = 'Crear cliente';
  public errores: string[] = [];
  public parameter : Region = new Region('Seleccione una región');

  constructor(
    private clienteService: ClienteService,
    private router: Router,
    private activatedRouter: ActivatedRoute
  ) {
    this.errores = [];
    this.regiones = [this.parameter];
  }
  getErrores(): string[] {
    return this.errores;
  }

  ngOnInit(): void {
    this.cargarCliente();
  }

  cargarCliente(): void {
    this.activatedRouter.params.subscribe((params) => {
      let id = params['id'];
      if (id) {
        this.clienteService
          .getCliente(id)
          .subscribe((cliente) => (this.cliente = cliente));
      }
    });

    this.clienteService
      .getRegiones()
      .subscribe((regiones) => (this.regiones = regiones));
  }
  public create(): void {
    console.log(this.cliente);
    this.clienteService.create(this.cliente).subscribe({
      next: (respForm) => {
        this.router.navigate(['/clientes']);
        Swal.fire({
          title: 'Nuevo cliente',
          text: 'Cliente ' + this.cliente.nombre + ' creado con exito!',
          icon: 'success',
        });
      },
      error: (err) => {
        this.errores = err.error.error as string[];
        console.error('Código del error desde el backend: ' + err.status);
        console.error(err.error.error);
      },
    });
    console.log('Click!');
    console.log(this.cliente);
  }
  update(): void {
    console.log(this.cliente);
    this.clienteService.update(this.cliente).subscribe(
      (json) => {
        this.router.navigate(['/clientes']);
        Swal.fire(
          'Cliente Actualizado',
          `${json.mensaje}: ${json.cliente.nombre}`,
          'success'
        );
      },
      (err) => {
        this.errores = err.error.errors as string[];
        console.error('Codigo del error desde el backend:' + err.status);
        console.error(err.error.errors);
      }
    );
  }
  compararRegion(o1: Region, o2: Region): boolean {
    if (o1 === null && o2 === null) {
      return true;
    }
    return o1 == null || o2 == null || o1 === undefined || o1 === undefined
      ? false
      : o1.id === o2.id;
  }
}
