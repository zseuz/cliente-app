import { Component } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { FormPage } from '../../shared/form-page';
import { Producto, ProductoSave } from '../producto.model';
import { ProductoService } from '../producto.service';

@Component({
  selector: 'app-producto-form',
  templateUrl: './producto-form.component.html',
})
export class ProductoFormComponent extends FormPage<Producto, ProductoSave> {
  protected readonly backUrl = '/productos';
  protected readonly entityName = 'Producto';

  readonly form = this.fb.group({
    codigo: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern(/^[A-Za-z0-9\-_]+$/)]],
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    descripcion: ['', [Validators.maxLength(1000)]],
    precio: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    activo: [true],
  });

  constructor(
    private readonly fb: NonNullableFormBuilder,
    service: ProductoService,
    route: ActivatedRoute,
    router: Router,
    notify: NotificationService,
  ) {
    super(service, route, router, notify);
  }

  protected override fill(p: Producto): void {
    this.form.patchValue({ ...p, descripcion: p.descripcion ?? '' });
  }

  protected toPayload(): ProductoSave {
    const p = this.form.getRawValue();
    return {
      ...p,
      codigo: p.codigo.trim().toUpperCase(),
      descripcion: p.descripcion.trim() || null,
      precio: Number(p.precio),
      stock: Number(p.stock),
    };
  }
}
