import { Component, OnInit } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { ListParams } from '../../core/models/paginated';
import { NotificationService } from '../../core/services/notification.service';
import { ListPage } from '../../shared/list-page';
import { Vendedor } from '../../vendedores/vendedor.model';
import { VendedorService } from '../../vendedores/vendedor.service';
import { Venta, VentaPage } from '../venta.model';
import { VentaService } from '../venta.service';

@Component({
  selector: 'app-venta-list',
  templateUrl: './venta-list.component.html',
})
export class VentaListComponent extends ListPage<Venta> implements OnInit {
  readonly filters = this.fb.group({ vendedorId: '', desde: '', hasta: '' });
  readonly vendedores$: Observable<Vendedor[]> = this.vendedorService.list({ limit: 100 }).pipe(map((r) => r.data));
  totalVendido = 0;

  constructor(
    private readonly fb: NonNullableFormBuilder,
    private readonly vendedorService: VendedorService,
    service: VentaService,
    notify: NotificationService,
  ) {
    super(service, notify);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.filters.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.page$.next(1));
  }

  protected override extraParams(): ListParams {
    const { vendedorId, desde, hasta } = this.filters.getRawValue();
    return {
      vendedorId: vendedorId || undefined,
      // Fechas locales -> rango del día completo en ISO.
      desde: desde ? new Date(`${desde}T00:00:00`).toISOString() : undefined,
      hasta: hasta ? new Date(`${hasta}T23:59:59.999`).toISOString() : undefined,
    };
  }

  protected override onLoaded(res: VentaPage): void {
    this.totalVendido = res.summary.totalVendido;
  }

  clearFilters(): void {
    this.filters.reset();
    this.search.setValue('');
  }
}
