import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { PageMeta } from '../../core/models/paginated';

/** Paginador presentacional (sin estado): emite la página solicitada. */
@Component({
  selector: 'app-pager',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav *ngIf="meta" class="d-flex flex-wrap justify-content-between align-items-center gap-2">
      <small class="text-muted">
        {{ meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1 }}–{{ min(meta.page * meta.limit, meta.total) }}
        de {{ meta.total }} registros
      </small>
      <ul class="pagination pagination-sm mb-0" *ngIf="meta.totalPages > 1">
        <li class="page-item" [class.disabled]="meta.page === 1">
          <button class="page-link" (click)="go(meta.page - 1)" aria-label="Anterior">&laquo;</button>
        </li>
        <li class="page-item" *ngFor="let p of pages" [class.active]="p === meta.page">
          <button class="page-link" (click)="go(p)">{{ p }}</button>
        </li>
        <li class="page-item" [class.disabled]="meta.page === meta.totalPages">
          <button class="page-link" (click)="go(meta.page + 1)" aria-label="Siguiente">&raquo;</button>
        </li>
      </ul>
    </nav>
  `,
})
export class PagerComponent {
  @Input() meta?: PageMeta;
  @Output() pageChange = new EventEmitter<number>();

  readonly min = Math.min;

  /** Ventana de hasta 5 páginas centrada en la actual. */
  get pages(): number[] {
    if (!this.meta) return [];
    const { page, totalPages } = this.meta;
    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
    const end = Math.min(totalPages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  go(page: number): void {
    if (this.meta && page >= 1 && page <= this.meta.totalPages && page !== this.meta.page) this.pageChange.emit(page);
  }
}
