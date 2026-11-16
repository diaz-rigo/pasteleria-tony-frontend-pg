import { Component, inject, OnInit, signal } from '@angular/core';
import { ProductosStore } from '../../../../store/productos/productos.store';
import { CategoriasStore } from '../../../../store/categorias/categorias.store';
import { ProductoList } from '../producto-list/producto-list';
import { ProductoForm } from '../producto-form/producto-form';
import { Producto } from '../../../../models/producto.model';

@Component({
  selector: 'app-productos',
  imports: [ProductoList, ProductoForm],
  templateUrl: './productos.html',
  styleUrl: './productos.css',
})
export class Productos implements OnInit {
  readonly store = inject(ProductosStore);
  readonly categoriasStore = inject(CategoriasStore);
  mostrarForm = false;
  readonly vistaMovil = signal<'lista' | 'formulario'>('lista');
  seleccionado: Producto | null = null;

  ngOnInit(): void {
    this.store.cargar();
    this.categoriasStore.cargar();
  }
  nuevo(): void { this.seleccionado = null; this.mostrarForm = true; this.vistaMovil.set('formulario'); }
  editar(p: Producto): void { this.seleccionado = p; this.mostrarForm = true; this.vistaMovil.set('formulario'); }
  cerrarForm(): void { this.mostrarForm = false; this.seleccionado = null; this.vistaMovil.set('lista'); }
  guardar(data: Partial<Producto>): void {
    if (this.seleccionado?.intProLlave) {
      this.store.actualizar(this.seleccionado.intProLlave, data, () => this.cerrarForm());
    } else {
      this.store.crear(data, () => this.cerrarForm());
    }
  }
}
