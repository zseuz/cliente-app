import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

const MESSAGES: Record<string, (e: any) => string> = {
  required: () => 'Este campo es obligatorio',
  email: () => 'Email inválido',
  minlength: (e) => `Mínimo ${e.requiredLength} caracteres`,
  maxlength: (e) => `Máximo ${e.requiredLength} caracteres`,
  min: (e) => `Debe ser mayor o igual a ${e.min}`,
  max: (e) => `Debe ser menor o igual a ${e.max}`,
  pattern: () => 'Formato inválido',
  server: (e) => e,
};

/** Muestra el primer error de validación de un control (cliente o servidor). */
@Component({
  selector: 'app-control-error',
  template: `<div class="invalid-feedback d-block" *ngIf="message">{{ message }}</div>`,
})
export class ControlErrorComponent {
  @Input() control: AbstractControl | null = null;

  get message(): string | null {
    const c = this.control;
    if (!c || !c.errors || !(c.touched || c.dirty)) return null;
    const [key, value] = Object.entries(c.errors)[0];
    return MESSAGES[key]?.(value) ?? (typeof value === 'string' ? value : 'Valor inválido');
  }
}
