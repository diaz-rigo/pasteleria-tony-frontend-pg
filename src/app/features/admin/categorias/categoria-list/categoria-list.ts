import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Categoria } from '../../../../models/categoria.model';
import { LucideLoader2, LucidePencil, LucideTags, LucideTrash2 } from '@lucide/angular';

@Component({
  selector: 'app-categoria-list',
  imports: [LucideLoader2, LucidePencil, LucideTags, LucideTrash2],
  templateUrl: './categoria-list.html',
  styleUrl: './categoria-list.css',
})
export class CategoriaList {
  @Input() categorias: Categoria[] = [];
  @Input() cargando = false;
  @Output() editar = new EventEmitter<Categoria>();
  @Output() eliminar = new EventEmitter<number>();
}
