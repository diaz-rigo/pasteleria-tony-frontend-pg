import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Usuario } from '../../../../models/usuario.model';

@Component({
  selector: 'app-usuario-list',
  imports: [],
  templateUrl: './usuario-list.html',
  styleUrl: './usuario-list.css',
})
export class UsuarioList {
  @Input() usuarios: Usuario[] = [];
  @Input() cargando = false;
  @Output() editar = new EventEmitter<Usuario>();
  @Output() eliminar = new EventEmitter<number>();
}
