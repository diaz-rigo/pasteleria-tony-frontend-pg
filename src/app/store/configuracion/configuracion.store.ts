import { inject, Injectable, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConfiguracionService } from './configuracion.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { Configuracion } from '../../models/configuracion.model';
import { EmailConfiguracion, EnlacePie, HorarioConfiguracion, RedSocialConfiguracion, TelefonoConfiguracion } from '../../models/entities.model';

@Injectable({ providedIn: 'root' })
export class ConfiguracionStore {
  private http = inject(ConfiguracionService);
  private toast = inject(ToastService);

  readonly config = signal<Configuracion | null>(null);
  readonly cargando = signal(false);
  readonly telefonos = signal<TelefonoConfiguracion[]>([]);
  readonly emails = signal<EmailConfiguracion[]>([]);
  readonly horarios = signal<HorarioConfiguracion[]>([]);
  readonly redes = signal<RedSocialConfiguracion[]>([]);
  readonly enlaces = signal<EnlacePie[]>([]);

  cargar(): void {
    this.cargando.set(true);
    forkJoin({
      config: this.http.listar(),
      telefonos: this.http.listarTelefonos().pipe(catchError(() => of({ ok: false, data: [] as TelefonoConfiguracion[] }))),
      emails: this.http.listarEmails().pipe(catchError(() => of({ ok: false, data: [] as EmailConfiguracion[] }))),
      horarios: this.http.listarHorarios().pipe(catchError(() => of({ ok: false, data: [] as HorarioConfiguracion[] }))),
      redes: this.http.listarRedes().pipe(catchError(() => of({ ok: false, data: [] as RedSocialConfiguracion[] }))),
      enlaces: this.http.listarEnlaces().pipe(catchError(() => of({ ok: false, data: [] as EnlacePie[] }))),
    }).subscribe({
      next: (res) => {
        this.cargando.set(false);
        const config = res.config.ok ? res.config.data?.[0] || null : null;
        this.config.set(config);
        const id = config?.intCfgLlave;
        this.telefonos.set((res.telefonos.data || []).filter(x => id == null || x.intCfgLlave === id));
        this.emails.set((res.emails.data || []).filter(x => id == null || x.intCfgLlave === id));
        this.horarios.set((res.horarios.data || []).filter(x => id == null || x.intCfgLlave === id));
        this.redes.set((res.redes.data || []).filter(x => (id == null || x.intCfgLlave === id) && x.blnRedActiva !== false));
        this.enlaces.set((res.enlaces.data || []).filter(x => id == null || x.intCfgLlave === id));
      },
      error: () => { this.cargando.set(false); },
    });
  }

  guardar(data: Partial<Configuracion>, onDone?: () => void): void {
    const actual = this.config();
    if (actual?.intCfgLlave) {
      this.http.actualizar(actual.intCfgLlave, data).subscribe({
        next: (res) => {
          if (res.ok && res.data) { this.config.set(res.data); this.toast.success('Configuración actualizada'); onDone?.(); }
          else this.toast.error(res.mensaje || 'Error');
        },
        error: () => this.toast.error('Error al actualizar'),
      });
    } else {
      this.http.crear(data).subscribe({
        next: (res) => {
          if (res.ok && res.data) { this.config.set(res.data); this.toast.success('Configuración creada'); onDone?.(); }
          else this.toast.error(res.mensaje || 'Error');
        },
        error: () => this.toast.error('Error al crear'),
      });
    }
  }
}
