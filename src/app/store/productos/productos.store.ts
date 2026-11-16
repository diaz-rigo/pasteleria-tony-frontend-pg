import { computed, inject, Injectable, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProductosService } from './productos.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ConfirmDialogService } from '../../shared/components/confirm-dialog/confirm-dialog.service';
import { Producto } from '../../models/producto.model';
import { CategoriasService } from '../categorias/categorias.service';
import { Categoria } from '../../models/categoria.model';
import { Calificacion, ImagenVariante, Talla, VarianteProducto } from '../../models/entities.model';

@Injectable({ providedIn: 'root' })
export class ProductosStore {
  private http = inject(ProductosService);
  private categoriasHttp = inject(CategoriasService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmDialogService);

  readonly productos = signal<Producto[]>([]);
  readonly seleccionado = signal<Producto | null>(null);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly categorias = signal<Categoria[]>([]);
  readonly variantes = signal<VarianteProducto[]>([]);
  readonly imagenes = signal<ImagenVariante[]>([]);
  readonly tallas = signal<Talla[]>([]);
  readonly calificaciones = signal<Calificacion[]>([]);
  readonly visibles = computed(() => this.categorias().filter(c => c.blnCtgActivo !== false));

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    forkJoin({
      productos: this.http.listar(),
      categorias: this.categoriasHttp.listar().pipe(catchError(() => of({ ok: false, data: [] as Categoria[] }))),
      variantes: this.http.listarVariantes().pipe(catchError(() => of({ ok: false, data: [] as VarianteProducto[] }))),
      imagenes: this.http.listarImagenesVariantes().pipe(catchError(() => of({ ok: false, data: [] as ImagenVariante[] }))),
      tallas: this.http.listarTallas().pipe(catchError(() => of({ ok: false, data: [] as Talla[] }))),
      calificaciones: this.http.listarCalificaciones().pipe(catchError(() => of({ ok: false, data: [] as Calificacion[] }))),
    }).subscribe({
      next: ({ productos, categorias, variantes, imagenes, tallas, calificaciones }) => {
        this.cargando.set(false);
        if (productos.ok && productos.data) this.productos.set(productos.data);
        else this.error.set(productos.mensaje || 'Error al cargar productos');
        this.categorias.set(categorias.data || []);
        this.variantes.set(variantes.data || []);
        this.imagenes.set(imagenes.data || []);
        this.tallas.set(tallas.data || []);
        this.calificaciones.set(calificaciones.data || []);
      },
      error: () => { this.cargando.set(false); this.error.set('Error al cargar el catálogo'); },
    });
  }

  imagenProducto(productoId: number): string | null {
    const variantIds = new Set(this.variantes().filter(v => v.intProLlave === productoId).map(v => v.intVarLlave));
    return this.imagenes().find(i => variantIds.has(i.intVarLlave))?.strImaUrl || null;
  }

  variantesProducto(productoId: number): VarianteProducto[] {
    return this.variantes().filter(v => v.intProLlave === productoId);
  }

  tallasProducto(productoId: number): Talla[] {
    const variantIds = new Set(this.variantesProducto(productoId).map(v => v.intVarLlave));
    return this.tallas().filter(t => variantIds.has(t.intVarLlave));
  }

  resumenCalificacion(productoId: number): { promedio: number; cantidad: number } | null {
    const puntuaciones = this.calificaciones().filter(r => r.intProLlave === productoId).map(r => Number(r.shtCalPuntuacion)).filter(n => n >= 1 && n <= 5);
    return puntuaciones.length ? { promedio: puntuaciones.reduce((sum, value) => sum + value, 0) / puntuaciones.length, cantidad: puntuaciones.length } : null;
  }
  obtener(id: number): void {
    this.cargando.set(true);
    this.http.obtenerPorId(id).subscribe({
      next: (res) => { this.cargando.set(false); if (res.ok && res.data) this.seleccionado.set(res.data); },
      error: () => { this.cargando.set(false); },
    });
  }
  crear(data: Partial<Producto>, onDone?: (producto?: Producto) => void): void {
    this.http.crear(data).subscribe({
      next: (res) => { if (res.ok) { this.toast.success(res.mensaje || 'Creado'); this.cargar(); onDone?.(res.data); } else this.toast.error(res.mensaje || 'Error'); },
      error: () => this.toast.error('Error al crear producto'),
    });
  }
  crearVariante(data: Partial<VarianteProducto>, onDone?: (variante?: VarianteProducto) => void): void {
    this.http.crearVariante(data).subscribe({
      next: res => { if (res.ok && res.data) { this.variantes.update(items => [...items, res.data!]); this.toast.success('Variante agregada'); onDone?.(res.data); } else this.toast.error(res.mensaje || 'No se pudo agregar la variante'); },
      error: () => this.toast.error('Error al agregar la variante'),
    });
  }
  crearImagenVariante(data: Partial<ImagenVariante>, onDone?: () => void): void {
    this.http.crearImagenVariante(data).subscribe({
      next: res => { if (res.ok && res.data) { this.imagenes.update(items => [...items, res.data!]); this.toast.success('Imagen agregada'); onDone?.(); } else this.toast.error(res.mensaje || 'No se pudo agregar la imagen'); },
      error: () => this.toast.error('Error al agregar la imagen'),
    });
  }
  async eliminarImagenVariante(id: number): Promise<void> {
    const ok = await this.confirm.confirmar('¿Eliminar esta imagen de la variante?');
    if (!ok) return;
    this.http.eliminarImagenVariante(id).subscribe({
      next: res => { if (res.ok) { this.imagenes.update(items => items.filter(item => item.intImaLlave !== id)); this.toast.success('Imagen eliminada'); } else this.toast.error(res.mensaje || 'No se pudo eliminar la imagen'); },
      error: () => this.toast.error('Error al eliminar la imagen'),
    });
  }
  actualizar(id: number, data: Partial<Producto>, onDone?: () => void): void {
    this.http.actualizar(id, data).subscribe({
      next: (res) => { if (res.ok) { this.toast.success(res.mensaje || 'Actualizado'); this.cargar(); onDone?.(); } else this.toast.error(res.mensaje || 'Error'); },
      error: () => this.toast.error('Error al actualizar producto'),
    });
  }
  async eliminar(id: number): Promise<void> {
    const ok = await this.confirm.confirmar('¿Eliminar este producto?');
    if (!ok) return;
    this.http.eliminar(id).subscribe({
      next: (res) => { if (res.ok) { this.toast.success(res.mensaje || 'Eliminado'); this.cargar(); } else this.toast.error(res.mensaje || 'Error'); },
      error: () => this.toast.error('Error al eliminar producto'),
    });
  }
}
