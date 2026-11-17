import { Component, inject, OnInit, signal } from '@angular/core';
import { CategoriasStore } from '../../../../store/categorias/categorias.store';
import { CategoriaList } from '../categoria-list/categoria-list';
import { CategoriaForm } from '../categoria-form/categoria-form';
import { Categoria } from '../../../../models/categoria.model';
import { LucideAlertTriangle, LucidePlus, LucideRefreshCw, LucideTags, LucideX } from '@lucide/angular';

@Component({
  selector: 'app-categorias',
  imports: [CategoriaList, CategoriaForm, LucideAlertTriangle, LucidePlus, LucideRefreshCw, LucideTags, LucideX],
  templateUrl: './categorias.html',
  styleUrl: './categorias.css',
})
export class Categorias implements OnInit {
  readonly store = inject(CategoriasStore);
  mostrarForm = false;
  readonly vistaMovil = signal<'lista' | 'formulario'>('lista');
  seleccionado: Categoria | null = null;

  ngOnInit(): void { this.store.cargar(); }
  nuevo(): void { this.seleccionado = null; this.mostrarForm = true; this.vistaMovil.set('formulario'); }
  editar(c: Categoria): void { this.seleccionado = c; this.mostrarForm = true; this.vistaMovil.set('formulario'); }
  cerrarForm(): void { this.mostrarForm = false; this.seleccionado = null; this.vistaMovil.set('lista'); }
  guardar(data: Partial<Categoria>): void {
    if (this.seleccionado?.id) {
      this.store.actualizar(this.seleccionado.id, data, () => this.cerrarForm());
    } else {
      this.store.crear(data, () => this.cerrarForm());
    }
  }
}
