import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';

export interface UsuarioSesion { intUsuLlave: number; strUsuEmail: string; strUsuRol: string; }

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly authHttp = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private sesionRestaurada = false;
  private restauracion?: Promise<boolean>;

  readonly usuario = signal<UsuarioSesion | null>(null);
  readonly autenticado = signal(false);
  readonly cargando = signal(false);

  constructor() {
    try { localStorage.removeItem('token'); localStorage.removeItem('usuario'); }
    catch { /* La sesión ya no depende de almacenamiento accesible a JavaScript. */ }
    if (typeof window !== 'undefined') window.addEventListener('pasteleria:auth-expired', () => this.sesionExpirada());
  }

  estaAutenticado(): boolean { return this.autenticado(); }
  tienePermiso(permiso: string): boolean { return this.usuario()?.strUsuRol === permiso || this.usuario()?.strUsuRol === 'ADMIN'; }

  restaurarSesion(): Promise<boolean> {
    if (this.sesionRestaurada) return Promise.resolve(this.estaAutenticado());
    if (this.restauracion) return this.restauracion;
    this.restauracion = firstValueFrom(this.authHttp.sesion()).then(res => {
      const usuario = res.ok ? res.data?.usuario : null;
      this.usuario.set(usuario || null);
      this.autenticado.set(!!usuario);
      return !!usuario;
    }).catch(() => {
      this.limpiarSesionLocal();
      return false;
    }).finally(() => {
      this.sesionRestaurada = true;
      this.restauracion = undefined;
    });
    return this.restauracion;
  }

  login(strUsuEmail: string, strUsuPassword: string): void {
    this.cargando.set(true);
    this.authHttp.login({ strUsuEmail, strUsuPassword }).subscribe({
      next: res => {
        this.cargando.set(false);
        if (!res.ok || !res.data?.usuario) {
          this.toast.error(res.mensaje || 'Correo o contraseña inválidos');
          return;
        }
        this.usuario.set(res.data.usuario);
        this.autenticado.set(true);
        this.sesionRestaurada = true;
        this.toast.success(res.mensaje || 'Bienvenido');
        void this.router.navigateByUrl(res.data.usuario.strUsuRol === 'ADMIN' ? '/admin' : '/');
      },
      error: error => { this.cargando.set(false); this.toast.error(error?.error?.mensaje || 'No se pudo iniciar sesión.'); },
    });
  }

  logout(): void {
    this.limpiarSesionLocal();
    this.sesionRestaurada = true;
    this.authHttp.logout().subscribe({ error: () => undefined });
    void this.router.navigateByUrl('/login');
  }

  sesionExpirada(): void {
    this.limpiarSesionLocal();
    this.sesionRestaurada = true;
    void this.router.navigateByUrl('/login');
  }

  private limpiarSesionLocal(): void {
    this.usuario.set(null);
    this.autenticado.set(false);
  }
}
