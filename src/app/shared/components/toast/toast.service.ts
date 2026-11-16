import { Injectable, signal } from '@angular/core';

export interface Toast { id: number; mensaje: string; tipo: 'success' | 'error' | 'info'; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();
  private counter = 0;

  mostrar(mensaje: string, tipo: Toast['tipo'] = 'info', duracion = 3500): void {
    const id = ++this.counter;
    this._toasts.update(list => [...list.slice(-2), { id, mensaje, tipo }]);
    setTimeout(() => this.cerrar(id), duracion);
  }
  success(mensaje: string): void { this.mostrar(mensaje, 'success'); }
  error(mensaje: string): void { this.mostrar(mensaje, 'error'); }
  info(mensaje: string): void { this.mostrar(mensaje, 'info'); }
  cerrar(id: number): void {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }
}
