import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Usuario } from '../../../../models/usuario.model';
import { LucideLoader2, LucidePencil, LucideTrash2, LucideUsers } from '@lucide/angular';

@Component({
  selector: 'app-usuario-list',
  imports: [LucideLoader2, LucidePencil, LucideTrash2, LucideUsers],
  templateUrl: './usuario-list.html',
  styleUrl: './usuario-list.css',
})
export class UsuarioList {
  @Input() usuarios: Usuario[] = [];
  @Input() cargando = false;
  @Output() editar = new EventEmitter<Usuario>();
  @Output() eliminar = new EventEmitter<number>();
}
