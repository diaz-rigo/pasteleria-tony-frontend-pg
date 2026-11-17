import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Categoria } from '../../../../models/categoria.model';
import { Producto } from '../../../../models/producto.model';
import { LucideSave, LucideX } from '@lucide/angular';

@Component({
  selector: 'app-producto-form',
  imports: [ReactiveFormsModule, LucideSave, LucideX],
  templateUrl: './producto-form.html',
  styleUrl: './producto-form.css',
})
export class ProductoForm {
  @Input() producto: Producto | null = null;
  @Input() categorias: Categoria[] = [];
  @Input() bloquearAcciones = false;
  @Output() guardar = new EventEmitter<Partial<Producto>>();
  @Output() cancelar = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  form = this.fb.nonNullable.group({
    strProNombre: ['', Validators.required],
    strProMarca: ['Pastelería Tony'],
    intCtgLlave: [0, [Validators.required, Validators.min(1)]],
    strProIngredientes: ['', Validators.required],
    strProDescripcion: [''],
    blnProDestacado: [false],
    strProEstadoDisponibilidad: ['available'],
  });

  ngOnChanges(): void {
    if (this.producto) {
      this.form.patchValue({
        strProNombre: this.producto.strProNombre,
        strProMarca: this.producto.strProMarca || 'Pastelería Tony',
        intCtgLlave: this.producto.intCtgLlave,
        strProIngredientes: this.producto.strProIngredientes,
        strProDescripcion: this.producto.strProDescripcion || '',
        blnProDestacado: this.producto.blnProDestacado ?? false,
        strProEstadoDisponibilidad: this.producto.strProEstadoDisponibilidad || 'available',
      });
    } else {
      this.form.reset({ strProMarca: 'Pastelería Tony', blnProDestacado: false, strProEstadoDisponibilidad: 'available', intCtgLlave: 0 });
    }
  }
  submit(): void {
    if (this.form.invalid) return;
    this.guardar.emit(this.form.getRawValue());
  }
}
