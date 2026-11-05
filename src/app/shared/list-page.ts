import { Directive, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { ListParams, PageMeta, Paginated } from '../core/models/paginated';
import { CrudService } from '../core/services/crud.service';
import { NotificationService } from '../core/services/notification.service';

/**
 * Lógica común de las pantallas de listado: búsqueda con debounce,
 * paginación, recarga y eliminación con confirmación.
 * `switchMap` cancela peticiones obsoletas si el usuario escribe rápido.
 */
@Directive()
export abstract class ListPage<T extends { id: number }> implements OnInit, OnDestroy {
  readonly search = new FormControl('', { nonNullable: true });
  items: T[] = [];
  meta?: PageMeta;
  loading = false;

  protected readonly page$ = new BehaviorSubject<number>(1);
  protected readonly reload$ = new BehaviorSubject<void>(undefined);
  protected readonly destroy$ = new Subject<void>();
  protected readonly limit = 10;

  protected constructor(protected readonly service: CrudService<T, any>, protected readonly notify: NotificationService) {}

  /** Filtros adicionales propios de cada pantalla. */
  protected extraParams(): ListParams {
    return {};
  }

  protected onLoaded(_res: Paginated<T>): void {}

  ngOnInit(): void {
    const search$ = this.search.valueChanges.pipe(
      startWith(this.search.value),
      debounceTime(300),
      map((s) => s.trim()),
      distinctUntilChanged(),
    );

    search$.pipe(takeUntil(this.destroy$)).subscribe(() => this.page$.next(1));

    combineLatest([search$, this.page$, this.reload$])
      .pipe(
        debounceTime(0),
        switchMap(([search, page]) => {
          this.loading = true;
          return this.service
            .list({ page, limit: this.limit, search, ...this.extraParams() })
            .pipe(finalize(() => (this.loading = false)));
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (res) => {
          this.items = res.data;
          this.meta = res.meta;
          this.onLoaded(res);
          // Si se eliminó el último registro de la última página, retroceder.
          if (res.data.length === 0 && res.meta.page > 1) this.page$.next(res.meta.totalPages);
        },
        error: (err) => this.notify.error(err),
      });
  }

  goTo(page: number): void {
    this.page$.next(page);
  }

  reload(): void {
    this.reload$.next();
  }

  async remove(item: T, label: string): Promise<void> {
    if (!(await this.notify.confirm(`Se eliminará ${label}. Esta acción no se puede deshacer.`))) return;
    this.service.delete(item.id).subscribe({
      next: () => {
        this.notify.success(`${label} eliminado`);
        this.reload();
      },
      error: (err) => this.notify.error(err),
    });
  }

  trackById(_: number, item: T): number {
    return item.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
