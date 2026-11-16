import { inject, Injectable, signal } from '@angular/core';
import { PedidosService } from './pedidos.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ConfirmDialogService } from '../../shared/components/confirm-dialog/confirm-dialog.service';
import { Pedido } from '../../models/pedido.model';

@Injectable({ providedIn: 'root' })
export class PedidosStore {
  private http = inject(PedidosService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmDialogService);

  readonly pedidos = signal<Pedido[]>([]);
  readonly seleccionado = signal<Pedido | null>(null);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  cargar(): void {
    this.cargando.set(true);
    this.http.listar().subscribe({
      next: (res) => { this.cargando.set(false); if (res.ok && res.data) this.pedidos.set(res.data); else this.error.set(res.mensaje || 'Error'); },
      error: () => { this.cargando.set(false); this.error.set('Error al cargar pedidos'); },
    });
  }
  crear(data: Partial<Pedido>, onDone?: () => void): void {
    this.http.crear(data).subscribe({
      next: (res) => { if (res.ok) { this.toast.success(res.mensaje || 'Pedido creado'); this.cargar(); onDone?.(); } else this.toast.error(res.mensaje || 'Error'); },
      error: () => this.toast.error('Error al crear pedido'),
    });
  }
  async eliminar(id: number): Promise<void> {
    const ok = await this.confirm.confirmar('¿Eliminar este pedido?');
    if (!ok) return;
    this.http.eliminar(id).subscribe({
      next: (res) => { if (res.ok) { this.toast.success(res.mensaje || 'Eliminado'); this.cargar(); } else this.toast.error(res.mensaje || 'Error'); },
      error: () => this.toast.error('Error al eliminar pedido'),
    });
  }
}
