import { Component, Input, OnInit } from '@angular/core';
import { Cliente } from '../cliente';
import { ClienteService } from '../cliente.service';
import { ModalService } from './modal.service';

//import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { AuthService } from '../../usuarios/auth.service';

@Component({
  selector: 'detalle-cliente',
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.css'],
})
export class DetalleComponent implements OnInit {
  @Input() cliente: Cliente;
  public titulo: string = 'detalle cliente';

  public fotoSeleccionada: File | null = null;

  public progreso: number = 0;

  // private fotoSeleccionada =  new File([""], "", {
  //   type: "text/plain",
  // })

  constructor(
    private clienteService: ClienteService,
    //private activatedRoute: ActivatedRoute,
    public modalService: ModalService,
    public authService:AuthService
  ) {
    this.cliente = new Cliente();
  }

  ngOnInit(): void {
    // this.activatedRoute.paramMap.subscribe((params) => {
    //   let id: number = +params.get('id')!;
    //   if (id) {
    //     this.clienteService.getCliente(id).subscribe((cliente) => {
    //       this.cliente = cliente;
    //     });
    //   }
    // });
  }
  seleccionarFoto(event: any) {
    this.fotoSeleccionada = event.target.files[0];
    this.progreso = 0;
    console.log(this.fotoSeleccionada);
    if (this.fotoSeleccionada?.type.indexOf('image')) {
      Swal.fire(
        'Error seleccionar imagen: ',
        'El archivo debe ser del tipo imagen',
        'error'
      );
      this.fotoSeleccionada = null;
    }
  }

  subirFoto() {
    if (!this.fotoSeleccionada) {
      Swal.fire('Error Upload: ', 'Debe seleccionar una foto', 'error');
    } else {
      this.clienteService
        .subirFoto(this.fotoSeleccionada, this.cliente.id)
        .subscribe((event) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.progreso = event.total
              ? Math.round((event.loaded / event.total) * 100)
              : 0;
          } else if (event.type === HttpEventType.Response) {
            let response: any = event.body;
            this.cliente = response.cliente as Cliente;
            this.modalService.notificarUpload.emit(this.cliente);
            Swal.fire(
              'La foto se ha subido completamente!',
              response.mensaje,
              'success'
            );
          }
        });
    }
  }
  cerrarModal() {
    this.modalService.cerrarModal();
    this.fotoSeleccionada = null;
    this.progreso = 0;
  }
}
