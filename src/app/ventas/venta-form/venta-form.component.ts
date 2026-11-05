import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import { Producto } from '../../productos/producto.model';
import { ProductoService } from '../../productos/producto.service';
import { FormPage } from '../../shared/form-page';
import { Vendedor } from '../../vendedores/vendedor.model';
import { VendedorService } from '../../vendedores/vendedor.service';
import { Venta, VentaSave } from '../venta.model';
import { VentaService } from '../venta.service';

@Component({
  selector: 'app-venta-form',
  templateUrl: './venta-form.component.html',
})
export class VentaFormComponent extends FormPage<Venta, VentaSave> implements OnInit {
  protected readonly backUrl = '/ventas';
  protected readonly entityName = 'Venta';

  readonly form = this.fb.group({
    vendedorId: [0, [Validators.required, Validators.min(1)]],
    productoId: [0, [Validators.required, Validators.min(1)]],
    cantidad: [1, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
    fecha: [this.toLocalInput(new Date()), [Validators.required]],
    observaciones: ['', [Validators.maxLength(255)]],
  });

  vendedores: Vendedor[] = [];
  productos: Producto[] = [];
  /** Venta original (en edición), necesaria para calcular stock y precio. */
  original: Venta | null = null;

  constructor(
    private readonly fb: NonNullableFormBuilder,
    private readonly vendedorService: VendedorService,
    private readonly productoService: ProductoService,
    @Inject(LOCALE_ID) private readonly locale: string,
    service: VentaService,
    route: ActivatedRoute,
    router: Router,
    notify: NotificationService,
  ) {
    super(service, route, router, notify);
  }

  override ngOnInit(): void {
    forkJoin({
      vendedores: this.vendedorService.list({ limit: 100 }),
      productos: this.productoService.list({ limit: 100 }),
    }).subscribe({
      next: ({ vendedores, productos }) => {
        this.vendedores = vendedores.data;
        this.productos = productos.data;
      },
      error: (err) => this.notify.error(err),
    });
    super.ngOnInit();
  }

  protected override fill(v: Venta): void {
    this.original = v;
    this.form.patchValue({
      vendedorId: v.vendedorId,
      productoId: v.productoId,
      cantidad: v.cantidad,
      fecha: this.toLocalInput(new Date(v.fecha)),
      observaciones: v.observaciones ?? '',
    });
  }

  /** Solo se ofrecen activos, más el registro ya asociado a la venta en edición. */
  get vendedoresDisponibles(): Vendedor[] {
    return this.vendedores.filter((v) => v.activo || v.id === this.original?.vendedorId);
  }

  get productosDisponibles(): Producto[] {
    return this.productos.filter((p) => p.activo || p.id === this.original?.productoId);
  }

  get productoSeleccionado(): Producto | undefined {
    return this.productos.find((p) => p.id === Number(this.form.controls.productoId.value));
  }

  private get mismoProducto(): boolean {
    return !!this.original && this.original.productoId === this.productoSeleccionado?.id;
  }

  /** Stock disponible considerando que, al editar, las unidades originales se devuelven. */
  get stockDisponible(): number {
    const p = this.productoSeleccionado;
    if (!p) return 0;
    return p.stock + (this.mismoProducto ? this.original!.cantidad : 0);
  }

  /** Mismo producto => se mantiene el precio histórico de la venta. */
  get precioUnitario(): number {
    if (this.mismoProducto) return this.original!.precioUnitario;
    return this.productoSeleccionado?.precio ?? 0;
  }

  get total(): number {
    return this.precioUnitario * (Number(this.form.controls.cantidad.value) || 0);
  }

  get excedeStock(): boolean {
    return !!this.productoSeleccionado && Number(this.form.controls.cantidad.value) > this.stockDisponible;
  }

  override submit(): void {
    if (this.excedeStock) {
      this.form.controls.cantidad.setErrors({ server: `Solo hay ${this.stockDisponible} unidades disponibles` });
      this.form.controls.cantidad.markAsTouched();
      return;
    }
    super.submit();
  }

  protected toPayload(): VentaSave {
    const v = this.form.getRawValue();
    return {
      vendedorId: Number(v.vendedorId),
      productoId: Number(v.productoId),
      cantidad: Number(v.cantidad),
      fecha: new Date(v.fecha).toISOString(),
      observaciones: v.observaciones.trim() || null,
    };
  }

  /** Formato que espera <input type="datetime-local">. */
  private toLocalInput(date: Date): string {
    return formatDate(date, "yyyy-MM-dd'T'HH:mm", this.locale);
  }

  get maxFecha(): string {
    return this.toLocalInput(new Date());
  }
}
