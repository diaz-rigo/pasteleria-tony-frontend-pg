import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private _visible = signal(false);
  private _mensaje = signal('');
  private resolver: ((r: boolean) => void) | null = null;

  readonly visible = this._visible.asReadonly();
  readonly mensaje = this._mensaje.asReadonly();

  confirmar(mensaje: string): Promise<boolean> {
    this._mensaje.set(mensaje);
    this._visible.set(true);
    return new Promise<boolean>(resolve => { this.resolver = resolve; });
  }
  aceptar(): void { this._visible.set(false); this.resolver?.(true); this.resolver = null; }
  cancelar(): void { this._visible.set(false); this.resolver?.(false); this.resolver = null; }
}
