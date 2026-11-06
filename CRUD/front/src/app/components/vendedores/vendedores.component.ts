import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Vendedor } from '../../models/vendedor';
import { VendedorService } from '../../services/vendedor.service';

@Component({
  selector: 'app-vendedores',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './vendedores.component.html'
})
export class VendedoresComponent implements OnInit {
  vendedores: Vendedor[] = [];
  vendedor: Vendedor = this.nuevo();
  editando = false;
  mensaje = '';
  error = '';

  constructor(private vendedorService: VendedorService) {}

  ngOnInit(): void {
    this.cargar();
  }

  nuevo(): Vendedor {
    return { nombre: '', apellido: '', correo: '', telefono: '' };
  }

  cargar() {
    this.vendedorService.listar().subscribe({
      next: (data) => this.vendedores = data,
      error: () => this.error = 'No se pudo conectar con el servidor'
    });
  }

  guardar() {
    this.mensaje = '';
    this.error = '';

    const peticion = this.editando
      ? this.vendedorService.actualizar(this.vendedor.id_vendedor!, this.vendedor)
      : this.vendedorService.crear(this.vendedor);

    peticion.subscribe({
      next: () => {
        this.mensaje = this.editando ? 'Vendedor actualizado' : 'Vendedor registrado';
        this.cancelar();
        this.cargar();
      },
      error: (err) => this.error = err.error?.mensaje || 'Ocurrio un error'
    });
  }

  editar(v: Vendedor) {
    this.vendedor = { ...v };
    this.editando = true;
  }

  eliminar(v: Vendedor) {
    if (!confirm(`¿Eliminar a ${v.nombre} ${v.apellido}?`)) return;

    this.vendedorService.eliminar(v.id_vendedor!).subscribe({
      next: () => {
        this.mensaje = 'Vendedor eliminado';
        this.cargar();
      },
      error: (err) => this.error = err.error?.mensaje || 'No se pudo eliminar'
    });
  }

  cancelar() {
    this.vendedor = this.nuevo();
    this.editando = false;
  }
}
