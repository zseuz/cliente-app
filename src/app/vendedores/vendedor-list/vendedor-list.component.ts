import { Component } from '@angular/core';
import { NotificationService } from '../../core/services/notification.service';
import { ListPage } from '../../shared/list-page';
import { Vendedor } from '../vendedor.model';
import { VendedorService } from '../vendedor.service';

@Component({
  selector: 'app-vendedor-list',
  templateUrl: './vendedor-list.component.html',
})
export class VendedorListComponent extends ListPage<Vendedor> {
  constructor(service: VendedorService, notify: NotificationService) {
    super(service, notify);
  }
}
