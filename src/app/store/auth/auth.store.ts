import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private authHttp = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  readonly token = signal<string | null>(localStorage.getItem('token'));
  readonly usuario = signal<{ intUsuLlave: number; strUsuEmail: string; strUsuRol: string } | null>(
    JSON.parse(localStorage.getItem('usuario') || 'null')
  );
  readonly cargando = signal(false);

  estaAutenticado(): boolean { return !!this.token(); }
  tienePermiso(permiso: string): boolean { return this.usuario()?.strUsuRol === permiso || this.usuario()?.strUsuRol === 'ADMIN'; }

  login(strUsuEmail: string, strUsuPassword: string): void {
    this.cargando.set(true);
    this.authHttp.login({ strUsuEmail, strUsuPassword }).subscribe({
      next: (res) => {
        this.cargando.set(false);
        if (res.ok && res.data) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
          this.token.set(res.data.token);
          this.usuario.set(res.data.usuario);
          this.toast.success(res.mensaje || 'Bienvenido');
          this.router.navigateByUrl('/admin');
        } else {
          this.toast.error(res.mensaje || 'Credenciales inválidas');
        }
      },
      error: () => { this.cargando.set(false); },
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.token.set(null);
    this.usuario.set(null);
    this.router.navigateByUrl('/login');
  }
}
