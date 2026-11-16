import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Categoria } from '../../../../models/categoria.model';

@Component({
  selector: 'app-categoria-list',
  imports: [],
  templateUrl: './categoria-list.html',
  styleUrl: './categoria-list.css',
})
export class CategoriaList {
  @Input() categorias: Categoria[] = [];
  @Input() cargando = false;
  @Output() editar = new EventEmitter<Categoria>();
  @Output() eliminar = new EventEmitter<number>();
}
