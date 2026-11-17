import { Component, effect, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { LucideAlertTriangle, LucideCheck, LucideInfo, LucideX } from '@lucide/angular';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { ToastService } from './shared/components/toast/toast.service';
import { ConfirmDialogService } from './shared/components/confirm-dialog/confirm-dialog.service';
import { Header } from './shared/layout/header/header';
import { ConfiguracionStore } from './store/configuracion/configuracion.store';
import { ThemeService } from './core/theme/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, Header, LucideAlertTriangle, LucideCheck, LucideInfo, LucideX],
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
  get footerForeground(): string | null {
    const fondo = this.config.config()?.strCfgColorFondoPie?.trim();
    if (!fondo) return null;
    const rgb = this.rgbDesdeColor(fondo);
    if (!rgb) return null;
    const luminancia = rgb.map(componente => {
      const lineal = componente / 255;
      return lineal <= .04045 ? lineal / 12.92 : ((lineal + .055) / 1.055) ** 2.4;
    }).reduce((suma, componente, indice) => suma + componente * [.2126, .7152, .0722][indice], 0);
    const contraste = (luz: number) => (Math.max(luminancia, luz) + .05) / (Math.min(luminancia, luz) + .05);
    const contrasteBlanco = contraste(1);
    const contrasteOscuro = contraste(.02);
    return contrasteBlanco >= contrasteOscuro ? '#ffffff' : '#30251f';
  }

  private rgbDesdeColor(color: string): [number, number, number] | null {
    const hexadecimal = color.match(/^#([\da-f]{3}|[\da-f]{6})$/i)?.[1];
    if (hexadecimal) {
      const expandido = hexadecimal.length === 3 ? [...hexadecimal].map(digito => digito + digito).join('') : hexadecimal;
      return [0, 2, 4].map(indice => Number.parseInt(expandido.slice(indice, indice + 2), 16)) as [number, number, number];
    }
    const rgb = color.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i);
    if (!rgb) return null;
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])].map(componente => Math.min(255, componente)) as [number, number, number];
  }
}
