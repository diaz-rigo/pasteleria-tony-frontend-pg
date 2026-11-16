import { inject, Injectable, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PortafoliosService } from './portafolios.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ConfirmDialogService } from '../../shared/components/confirm-dialog/confirm-dialog.service';
import { Portafolio } from '../../models/portafolio.model';
import { ColorPortafolio, EtiquetaPortafolio } from '../../models/entities.model';

@Injectable({ providedIn: 'root' })
export class PortafoliosStore {
  private http = inject(PortafoliosService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmDialogService);
  readonly items = signal<Portafolio[]>([]);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly etiquetas = signal<EtiquetaPortafolio[]>([]);
  readonly colores = signal<ColorPortafolio[]>([]);
  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    forkJoin({
      items: this.http.listar(),
      etiquetas: this.http.listarEtiquetas().pipe(catchError(() => of({ ok: false, data: [] as EtiquetaPortafolio[] }))),
      colores: this.http.listarColores().pipe(catchError(() => of({ ok: false, data: [] as ColorPortafolio[] }))),
    }).subscribe({
      next: ({ items, etiquetas, colores }) => {
        this.cargando.set(false);
        if (items.ok && items.data) this.items.set(items.data);
        else this.error.set(items.mensaje || 'No se pudo cargar el portafolio');
        this.etiquetas.set(etiquetas.data || []);
        this.colores.set(colores.data || []);
      },
      error: () => { this.cargando.set(false); this.error.set('Error al cargar el portafolio'); },
    });
  }
  etiquetasDe(id: number): EtiquetaPortafolio[] { return this.etiquetas().filter(x => x.intPorLlave === id); }
  coloresDe(id: number): ColorPortafolio[] { return this.colores().filter(x => x.intPorLlave === id); }
  crear(data: Partial<Portafolio>, onDone?: (registro?:Portafolio) => void): void {
    this.http.crear(data).subscribe({ next: (res) => { if (res.ok) { this.toast.success('Proyecto creado'); this.cargar(); onDone?.(res.data); } else this.toast.error(res.mensaje || 'Error'); }, error: () => this.toast.error('No se pudo crear el proyecto') });
  }
  actualizar(id: number, data: Partial<Portafolio>, onDone?: () => void): void {
    this.http.actualizar(id, data).subscribe({ next: (res) => { if (res.ok) { this.toast.success('Actualizado'); this.cargar(); onDone?.(); } else this.toast.error(res.mensaje || 'Error'); }, error: () => this.toast.error('Error') });
  }
  async eliminar(id: number): Promise<void> {
    const ok = await this.confirm.confirmar('¿Eliminar este elemento?');
    if (!ok) return;
    this.http.eliminar(id).subscribe({ next: (res) => { if (res.ok) { this.toast.success('Eliminado'); this.cargar(); } else this.toast.error(res.mensaje || 'Error'); }, error: () => this.toast.error('Error') });
  }
}
