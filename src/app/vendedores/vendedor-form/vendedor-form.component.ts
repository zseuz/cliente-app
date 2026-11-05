import { Component } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { FormPage } from '../../shared/form-page';
import { Vendedor, VendedorSave } from '../vendedor.model';
import { VendedorService } from '../vendedor.service';

@Component({
  selector: 'app-vendedor-form',
  templateUrl: './vendedor-form.component.html',
})
export class VendedorFormComponent extends FormPage<Vendedor, VendedorSave> {
  protected readonly backUrl = '/vendedores';
  protected readonly entityName = 'Vendedor';

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    telefono: ['', [Validators.pattern(/^[0-9+\-\s()]{7,20}$/)]],
    activo: [true],
  });

  constructor(
    private readonly fb: NonNullableFormBuilder,
    service: VendedorService,
    route: ActivatedRoute,
    router: Router,
    notify: NotificationService,
  ) {
    super(service, route, router, notify);
  }

  protected override fill(v: Vendedor): void {
    this.form.patchValue({ ...v, telefono: v.telefono ?? '' });
  }

  protected toPayload(): VendedorSave {
    const v = this.form.getRawValue();
    return { ...v, telefono: v.telefono.trim() || null };
  }
}
