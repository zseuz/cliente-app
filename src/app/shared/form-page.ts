import { Directive, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { CrudService } from '../core/services/crud.service';
import { NotificationService } from '../core/services/notification.service';

/**
 * Lógica común de los formularios crear/editar: carga por :id,
 * validación, envío, manejo de errores y navegación de regreso.
 */
@Directive()
export abstract class FormPage<T extends { id: number }, TSave> implements OnInit {
  abstract readonly form: FormGroup;
  /** Ruta del listado al que se vuelve tras guardar. */
  protected abstract readonly backUrl: string;
  /** Nombre legible de la entidad para los mensajes. */
  protected abstract readonly entityName: string;

  id: number | null = null;
  saving = false;
  loading = false;

  protected constructor(
    protected readonly service: CrudService<T, TSave>,
    protected readonly route: ActivatedRoute,
    protected readonly router: Router,
    protected readonly notify: NotificationService,
  ) {}

  get isEdit(): boolean {
    return this.id !== null;
  }

  /** Convierte el valor del formulario en el payload de la API. */
  protected abstract toPayload(): TSave;

  /** Carga la entidad en el formulario (por defecto patchValue directo). */
  protected fill(entity: T): void {
    this.form.patchValue(entity as any);
  }

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('id');
    if (!param) return;
    this.id = Number(param);
    this.loading = true;
    this.service
      .get(this.id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (entity) => this.fill(entity),
        error: (err) => {
          this.notify.error(err);
          this.router.navigateByUrl(this.backUrl);
        },
      });
  }

  isInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = this.toPayload();
    const request$: Observable<T> = this.isEdit ? this.service.update(this.id!, payload) : this.service.create(payload);

    this.saving = true;
    request$.pipe(finalize(() => (this.saving = false))).subscribe({
      next: () => {
        this.notify.success(`${this.entityName} ${this.isEdit ? 'actualizado' : 'creado'} correctamente`);
        this.router.navigateByUrl(this.backUrl);
      },
      error: (err) => this.notify.error(err, this.form),
    });
  }
}
