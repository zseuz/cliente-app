import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { ApiError } from '../models/paginated';

/** Centraliza los mensajes al usuario y el manejo de errores HTTP de la API. */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  success(message: string, title = 'Listo'): void {
    Swal.fire({ title, text: message, icon: 'success', timer: 1800, showConfirmButton: false });
  }

  async confirm(message: string, title = '¿Está seguro?'): Promise<boolean> {
    const result = await Swal.fire({
      title,
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
      reverseButtons: true,
    });
    return result.isConfirmed;
  }

  /**
   * Muestra el error de la API. Si se pasa el formulario, los errores por
   * campo (400) se asignan a cada control como `{ server: mensaje }`.
   */
  error(err: unknown, form?: FormGroup): void {
    const http = err instanceof HttpErrorResponse ? err : null;
    const body = (http?.error ?? {}) as ApiError;

    if (http?.status === 0) {
      Swal.fire('Sin conexión', 'No fue posible contactar la API. ¿Está corriendo el backend?', 'error');
      return;
    }

    if (form && body.errors?.length) {
      body.errors.forEach(({ field, message }) => {
        const control: AbstractControl | null = form.get(field);
        control?.setErrors({ ...(control.errors ?? {}), server: message });
        control?.markAsTouched();
      });
    }

    const detail = body.errors?.map((e) => `• ${e.field}: ${e.message}`).join('<br>');
    Swal.fire({
      title: 'Error',
      html: `${body.message ?? 'Ocurrió un error inesperado'}${detail ? `<br><small>${detail}</small>` : ''}`,
      icon: 'error',
    });
  }
}
