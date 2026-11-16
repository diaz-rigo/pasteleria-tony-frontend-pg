import { inject, Injectable, signal } from '@angular/core';
import { CategoriasService } from './categorias.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ConfirmDialogService } from '../../shared/components/confirm-dialog/confirm-dialog.service';
import { Categoria } from '../../models/categoria.model';

@Injectable({ providedIn: 'root' })
export class CategoriasStore {
  private http = inject(CategoriasService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmDialogService);

  readonly categorias = signal<Categoria[]>([]);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.http.listar().subscribe({
      next: (res) => { this.cargando.set(false); if (res.ok && res.data) this.categorias.set(res.data); else this.error.set(res.mensaje || 'Error'); },
      error: () => { this.cargando.set(false); this.error.set('Error al cargar categorías'); },
    });
  }
  crear(data: Partial<Categoria>, onDone?: () => void): void {
    this.http.crear(data).subscribe({
      next: (res) => { if (res.ok) { this.toast.success(res.mensaje || 'Creado'); this.cargar(); onDone?.(); } else this.toast.error(res.mensaje || 'Error'); },
      error: () => this.toast.error('Error al crear categoría'),
    });
  }
  actualizar(id: number, data: Partial<Categoria>, onDone?: () => void): void {
    this.http.actualizar(id, data).subscribe({
      next: (res) => { if (res.ok) { this.toast.success(res.mensaje || 'Actualizado'); this.cargar(); onDone?.(); } else this.toast.error(res.mensaje || 'Error'); },
      error: () => this.toast.error('Error al actualizar categoría'),
    });
  }
  async eliminar(id: number): Promise<void> {
    const ok = await this.confirm.confirmar('¿Eliminar esta categoría?');
    if (!ok) return;
    this.http.eliminar(id).subscribe({
      next: (res) => { if (res.ok) { this.toast.success(res.mensaje || 'Eliminado'); this.cargar(); } else this.toast.error(res.mensaje || 'Error'); },
      error: () => this.toast.error('Error al eliminar categoría'),
    });
  }
}
