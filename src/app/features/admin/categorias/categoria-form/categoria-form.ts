import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Categoria } from '../../../../models/categoria.model';

@Component({
  selector: 'app-categoria-form',
  imports: [ReactiveFormsModule],
  templateUrl: './categoria-form.html',
  styleUrl: './categoria-form.css',
})
export class CategoriaForm {
  @Input() categoria: Categoria | null = null;
  @Output() guardar = new EventEmitter<Partial<Categoria>>();
  @Output() cancelar = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  form = this.fb.nonNullable.group({
    strCtgNombre: ['', Validators.required],
    strCtgDescripcion: [''],
    blnCtgActivo: [true],
  });

  ngOnChanges(): void {
    if (this.categoria) {
      this.form.patchValue({
        strCtgNombre: this.categoria.strCtgNombre,
        strCtgDescripcion: this.categoria.strCtgDescripcion || '',
        blnCtgActivo: this.categoria.blnCtgActivo ?? true,
      });
    } else {
      this.form.reset({ strCtgNombre: '', strCtgDescripcion: '', blnCtgActivo: true });
    }
  }
  submit(): void {
    if (this.form.invalid) return;
    this.guardar.emit(this.form.getRawValue());
  }
}
