import { inject, Injectable, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GaleriasService } from './galerias.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ConfirmDialogService } from '../../shared/components/confirm-dialog/confirm-dialog.service';
import { Galeria } from '../../models/galeria.model';
import { CategoriaGaleria, EtiquetaGaleria, ImagenGaleria } from '../../models/entities.model';

@Injectable({ providedIn: 'root' })
export class GaleriasStore {
  private http = inject(GaleriasService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmDialogService);
  readonly items = signal<Galeria[]>([]);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly imagenes = signal<ImagenGaleria[]>([]);
  readonly categorias = signal<CategoriaGaleria[]>([]);
  readonly etiquetas = signal<EtiquetaGaleria[]>([]);
  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    forkJoin({
      galerias: this.http.listar(),
      imagenes: this.http.listarImagenes().pipe(catchError(() => of({ ok: false, data: [] as ImagenGaleria[] }))),
      categorias: this.http.listarCategorias().pipe(catchError(() => of({ ok: false, data: [] as CategoriaGaleria[] }))),
      etiquetas: this.http.listarEtiquetas().pipe(catchError(() => of({ ok: false, data: [] as EtiquetaGaleria[] }))),
    }).subscribe({
      next: ({ galerias, imagenes, categorias, etiquetas }) => {
        this.cargando.set(false);
        if (galerias.ok && galerias.data) this.items.set(galerias.data);
        else this.error.set(galerias.mensaje || 'No se pudo cargar la galería');
        this.imagenes.set(imagenes.data || []);
        this.categorias.set(categorias.data || []);
        this.etiquetas.set(etiquetas.data || []);
      },
      error: () => { this.cargando.set(false); this.error.set('Error al cargar la galería'); },
    });
  }
  imagenesDe(galeriaId: number): ImagenGaleria[] { return this.imagenes().filter(i => i.intGalLlave === galeriaId); }
  guardarImagen(galeriaId:number, url:string, onDone?:()=>void):void {
    const limpia=url.trim();
    if(!limpia){onDone?.();return;}
    const actual=this.imagenesDe(galeriaId)[0];
    const request=actual?.intImgLlave
      ? this.http.actualizarImagen(actual.intImgLlave,{...actual,strImgUrl:limpia})
      : this.http.crearImagen({intGalLlave:galeriaId,strImgUrl:limpia});
    request.subscribe({
      next:res=>{if(res.ok){this.toast.success('Imagen de galería guardada');this.cargar();onDone?.();}else this.toast.error(res.mensaje||'No se pudo guardar la imagen');},
      error:()=>this.toast.error('No se pudo guardar la imagen'),
    });
  }
  categoriasDe(galeriaId: number): CategoriaGaleria[] { return this.categorias().filter(x => x.intGalLlave === galeriaId); }
  etiquetasDe(galeriaId: number): EtiquetaGaleria[] { return this.etiquetas().filter(x => x.intGalLlave === galeriaId); }
  crear(data: Partial<Galeria>, onDone?: (registro?: Galeria) => void): void {
    this.http.crear(data).subscribe({ next: (res) => { if (res.ok) { this.toast.success('Galería creada'); this.cargar(); onDone?.(res.data); } else this.toast.error(res.mensaje || 'Error'); }, error: () => this.toast.error('No se pudo crear la galería') });
  }
  actualizar(id: number, data: Partial<Galeria>, onDone?: () => void): void {
    this.http.actualizar(id, data).subscribe({ next: (res) => { if (res.ok) { this.toast.success('Actualizado'); this.cargar(); onDone?.(); } else this.toast.error(res.mensaje || 'Error'); }, error: () => this.toast.error('Error') });
  }
  async eliminar(id: number): Promise<void> {
    const ok = await this.confirm.confirmar('¿Eliminar este elemento?');
    if (!ok) return;
    this.http.eliminar(id).subscribe({ next: (res) => { if (res.ok) { this.toast.success('Eliminado'); this.cargar(); } else this.toast.error(res.mensaje || 'Error'); }, error: () => this.toast.error('Error') });
  }
}
