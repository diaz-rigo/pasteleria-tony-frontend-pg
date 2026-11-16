import { Component, effect, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { ToastService } from './shared/components/toast/toast.service';
import { ConfirmDialogService } from './shared/components/confirm-dialog/confirm-dialog.service';
import { Header } from './shared/layout/header/header';
import { ConfiguracionStore } from './store/configuracion/configuracion.store';
import { ThemeService } from './core/theme/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  readonly toast = inject(ToastService);
  readonly confirm = inject(ConfirmDialogService);
  readonly config = inject(ConfiguracionStore);
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  readonly enAdministracion = toSignal(this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map(event => (event as NavigationEnd).urlAfterRedirects.startsWith('/admin')),
    startWith(this.router.url.startsWith('/admin')),
  ), { initialValue: this.router.url.startsWith('/admin') });
  readonly currentYear = new Date().getFullYear();
  private readonly syncTheme = effect(() => {
    const color = this.config.config()?.strCfgColorPrimario;
    if (color) this.theme.setAccent(color);
  });
  ngOnInit(): void { this.config.cargar(); }
  get footerText(): string { return this.config.config()?.strCfgTextoPie || ''; }
}
