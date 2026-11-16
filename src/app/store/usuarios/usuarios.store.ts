import { inject, Injectable, signal } from '@angular/core';
import { UsuariosService } from './usuarios.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ConfirmDialogService } from '../../shared/components/confirm-dialog/confirm-dialog.service';
import { Usuario } from '../../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuariosStore {
  private http = inject(UsuariosService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmDialogService);

  readonly usuarios = signal<Usuario[]>([]);
  readonly seleccionado = signal<Usuario | null>(null);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.http.listar().subscribe({
      next: (res) => {
        this.cargando.set(false);
        if (res.ok && res.data) this.usuarios.set(res.data);
        else this.error.set(res.mensaje || 'Error');
      },
      error: () => { this.cargando.set(false); this.error.set('Error al cargar usuarios'); },
    });
  }

  obtener(id: number): void {
    this.cargando.set(true);
    this.http.obtenerPorId(id).subscribe({
      next: (res) => {
        this.cargando.set(false);
        if (res.ok && res.data) this.seleccionado.set(res.data);
      },
      error: () => { this.cargando.set(false); },
    });
  }

  crear(data: Partial<Usuario>, onDone?: () => void): void {
    this.http.crear(data).subscribe({
      next: (res) => {
        if (res.ok) {
          this.toast.success(res.mensaje || 'Usuario creado');
          this.cargar();
          onDone?.();
        } else {
          this.toast.error(res.mensaje || 'Error');
        }
      },
      error: () => this.toast.error('Error al crear usuario'),
    });
  }

  actualizar(id: number, data: Partial<Usuario>, onDone?: () => void): void {
    this.http.actualizar(id, data).subscribe({
      next: (res) => {
        if (res.ok) {
          this.toast.success(res.mensaje || 'Usuario actualizado');
          this.cargar();
          onDone?.();
        } else {
          this.toast.error(res.mensaje || 'Error');
        }
      },
      error: () => this.toast.error('Error al actualizar usuario'),
    });
  }

  async eliminar(id: number): Promise<void> {
    const ok = await this.confirm.confirmar('¿Eliminar este usuario?');
    if (!ok) return;
    this.http.eliminar(id).subscribe({
      next: (res) => {
        if (res.ok) {
          this.toast.success(res.mensaje || 'Usuario eliminado');
          this.cargar();
        } else {
          this.toast.error(res.mensaje || 'Error');
        }
      },
      error: () => this.toast.error('Error al eliminar usuario'),
    });
  }
}
