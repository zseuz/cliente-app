import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ControlErrorComponent } from './control-error/control-error.component';
import { PagerComponent } from './pager/pager.component';

@NgModule({
  declarations: [PagerComponent, ControlErrorComponent],
  imports: [CommonModule],
  exports: [CommonModule, ReactiveFormsModule, RouterModule, PagerComponent, ControlErrorComponent],
})
export class SharedModule {}
