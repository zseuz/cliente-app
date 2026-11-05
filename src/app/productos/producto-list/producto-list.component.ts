import { Component } from '@angular/core';
import { NotificationService } from '../../core/services/notification.service';
import { ListPage } from '../../shared/list-page';
import { Producto } from '../producto.model';
import { ProductoService } from '../producto.service';

@Component({
  selector: 'app-producto-list',
  templateUrl: './producto-list.component.html',
})
export class ProductoListComponent extends ListPage<Producto> {
  /** Umbral para resaltar productos con poco inventario. */
  readonly lowStock = 5;

  constructor(service: ProductoService, notify: NotificationService) {
    super(service, notify);
  }
}
