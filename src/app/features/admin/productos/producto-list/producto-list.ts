import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Producto } from '../../../../models/producto.model';
import { Categoria } from '../../../../models/categoria.model';
import { LucideLoader2, LucidePackage, LucidePencil, LucideTrash2 } from '@lucide/angular';

@Component({
  selector: 'app-producto-list',
  imports: [LucideLoader2, LucidePackage, LucidePencil, LucideTrash2],
  templateUrl: './producto-list.html',
  styleUrl: './producto-list.css',
})
export class ProductoList {
  @Input() productos: Producto[] = [];
  @Input() categorias: Categoria[] = [];
  @Input() cargando = false;
  @Output() editar = new EventEmitter<Producto>();
  @Output() eliminar = new EventEmitter<number>();
  categoriaNombre(id:number):string { return this.categorias.find(c=>c.intCtgLlave===id)?.strCtgNombre || 'Sin categoría'; }
}
