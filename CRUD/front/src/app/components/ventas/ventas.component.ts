import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Venta } from '../../models/venta';
import { Vendedor } from '../../models/vendedor';
import { Producto } from '../../models/producto';
import { VentaService } from '../../services/venta.service';
import { VendedorService } from '../../services/vendedor.service';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './ventas.component.html'
})
export class VentasComponent implements OnInit {
  ventas: Venta[] = [];
  vendedores: Vendedor[] = [];
  productos: Producto[] = [];
  venta: Venta = this.nueva();
  editando = false;
  mensaje = '';
  error = '';

  constructor(
    private ventaService: VentaService,
    private vendedorService: VendedorService,
    private productoService: ProductoService
  ) {}

  ngOnInit(): void {
    this.cargar();
    this.vendedorService.listar().subscribe(data => this.vendedores = data);
  }

  nueva(): Venta {
    const d = new Date();
    // fecha local en formato yyyy-mm-dd para el input date
    const hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { id_vendedor: null, id_producto: null, cantidad: 1, fecha: hoy };
  }

  cargar() {
    this.ventaService.listar().subscribe({
      next: (data) => this.ventas = data,
      error: () => this.error = 'No se pudo conectar con el servidor'
    });
    // los productos se recargan para ver el stock actualizado
    this.productoService.listar().subscribe(data => this.productos = data);
  }

  // total aproximado para mostrar en el formulario, el real lo calcula el back
  get totalCalculado(): number {
    const prod = this.productos.find(p => p.id_producto == this.venta.id_producto);
    return prod ? Number(prod.precio) * this.venta.cantidad : 0;
  }

  guardar() {
    this.mensaje = '';
    this.error = '';

    const peticion = this.editando
      ? this.ventaService.actualizar(this.venta.id_venta!, this.venta)
      : this.ventaService.crear(this.venta);

    peticion.subscribe({
      next: () => {
        this.mensaje = this.editando ? 'Venta actualizada' : 'Venta registrada';
        this.cancelar();
        this.cargar();
      },
      error: (err) => this.error = err.error?.mensaje || 'Ocurrio un error'
    });
  }

  editar(v: Venta) {
    this.venta = { ...v };
    this.editando = true;
  }

  eliminar(v: Venta) {
    if (!confirm(`¿Eliminar la venta #${v.id_venta}?`)) return;

    this.ventaService.eliminar(v.id_venta!).subscribe({
      next: () => {
        this.mensaje = 'Venta eliminada';
        this.cargar();
      },
      error: (err) => this.error = err.error?.mensaje || 'No se pudo eliminar'
    });
  }

  cancelar() {
    this.venta = this.nueva();
    this.editando = false;
  }
}
