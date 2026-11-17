import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Categoria } from '../../../../models/categoria.model';
import { LucideSave, LucideX } from '@lucide/angular';

@Component({
  selector: 'app-categoria-form',
  imports: [ReactiveFormsModule, LucideSave, LucideX],
  templateUrl: './categoria-form.html',
  styleUrl: './categoria-form.css',
})
export class CategoriaForm {
  @Input() categoria: Categoria | null = null;
  @Input() categorias: Categoria[] = [];
  @Output() guardar = new EventEmitter<Partial<Categoria>>();
  @Output() cancelar = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    idPadre: [null as number | null],
    activa: [true],
  });

  categoriasPadre(): Categoria[] { return this.categorias.filter(c => !c.idPadre && c.id !== this.categoria?.id); }

  ngOnChanges(): void {
    if (this.categoria) {
      this.form.patchValue({
        nombre: this.categoria.nombre,
        descripcion: this.categoria.descripcion || '',
        idPadre: this.categoria.idPadre ?? null,
        activa: this.categoria.activa ?? true,
      });
    } else {
      this.form.reset({ nombre: '', descripcion: '', idPadre: null, activa: true });
    }
  }
  submit(): void {
    if (this.form.invalid) return;
    this.guardar.emit(this.form.getRawValue());
  }
}
