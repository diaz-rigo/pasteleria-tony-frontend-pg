import { Component, inject, OnInit, signal } from '@angular/core';
import { UsuariosStore } from '../../../../store/usuarios/usuarios.store';
import { UsuarioList } from '../usuario-list/usuario-list';
import { UsuarioForm } from '../usuario-form/usuario-form';
import { Usuario } from '../../../../models/usuario.model';
import { LucideAlertTriangle, LucidePlus, LucideRefreshCw, LucideUsers, LucideX } from '@lucide/angular';

@Component({
  selector: 'app-usuarios',
  imports: [UsuarioList, UsuarioForm, LucideAlertTriangle, LucidePlus, LucideRefreshCw, LucideUsers, LucideX],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios implements OnInit {
  readonly store = inject(UsuariosStore);
  mostrarForm = false;
  readonly vistaMovil = signal<'lista' | 'formulario'>('lista');
  seleccionado: Usuario | null = null;

  ngOnInit(): void { this.store.cargar(); }

  nuevo(): void { this.seleccionado = null; this.mostrarForm = true; this.vistaMovil.set('formulario'); }
  editar(u: Usuario): void { this.seleccionado = u; this.mostrarForm = true; this.vistaMovil.set('formulario'); }
  cerrarForm(): void { this.mostrarForm = false; this.seleccionado = null; this.vistaMovil.set('lista'); }
  guardar(data: Partial<Usuario>): void {
    if (this.seleccionado?.intUsuLlave) {
      this.store.actualizar(this.seleccionado.intUsuLlave, data, () => this.cerrarForm());
    } else {
      this.store.crear(data, () => this.cerrarForm());
    }
  }
}
