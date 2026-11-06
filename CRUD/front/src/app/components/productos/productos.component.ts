import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Producto } from '../../models/producto';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './productos.component.html'
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  producto: Producto = this.nuevo();
  editando = false;
  mensaje = '';
  error = '';

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.cargar();
  }

  nuevo(): Producto {
    return { nombre: '', descripcion: '', precio: 0, stock: 0 };
  }

  cargar() {
    this.productoService.listar().subscribe({
      next: (data) => this.productos = data,
      error: () => this.error = 'No se pudo conectar con el servidor'
    });
  }

  guardar() {
    this.mensaje = '';
    this.error = '';

    const peticion = this.editando
      ? this.productoService.actualizar(this.producto.id_producto!, this.producto)
      : this.productoService.crear(this.producto);

    peticion.subscribe({
      next: () => {
        this.mensaje = this.editando ? 'Producto actualizado' : 'Producto registrado';
        this.cancelar();
        this.cargar();
      },
      error: (err) => this.error = err.error?.mensaje || 'Ocurrio un error'
    });
  }

  editar(p: Producto) {
    // el precio llega como texto desde postgres
    this.producto = { ...p, precio: Number(p.precio) };
    this.editando = true;
  }

  eliminar(p: Producto) {
    if (!confirm(`¿Eliminar el producto ${p.nombre}?`)) return;

    this.productoService.eliminar(p.id_producto!).subscribe({
      next: () => {
        this.mensaje = 'Producto eliminado';
        this.cargar();
      },
      error: (err) => this.error = err.error?.mensaje || 'No se pudo eliminar'
    });
  }

  cancelar() {
    this.producto = this.nuevo();
    this.editando = false;
  }
}
