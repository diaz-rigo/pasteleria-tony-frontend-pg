import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProductosService } from './productos.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ConfirmDialogService } from '../../shared/components/confirm-dialog/confirm-dialog.service';
import { Categoria } from '../../models/categoria.model';
import { CategoriasService } from '../categorias/categorias.service';
import { FotoProducto, PresentacionProducto, Producto, PublicacionProducto, SaborPorCategoria } from '../../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductosStore {
  private readonly api = inject(ProductosService);
  private readonly categoriasApi = inject(CategoriasService);
  private readonly avisos = inject(ToastService);
  private readonly confirmacion = inject(ConfirmDialogService);
  readonly productos = signal<Producto[]>([]);
  readonly seleccionado = signal<Producto | null>(null);
  readonly categorias = signal<Categoria[]>([]);
  readonly saboresPorCategoria = signal<SaborPorCategoria[]>([]);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly visibles = computed(() => this.categorias().filter(categoria => categoria.activa && !categoria.idPadre));

  cargar(): void {
    this.cargando.set(true); this.error.set(null);
    forkJoin({
      productos: this.api.listar(),
      categorias: this.categoriasApi.listar().pipe(catchError(() => of({ ok: false, data: [] as Categoria[] }))),
      sabores: this.api.listarCatalogoSabores().pipe(catchError(() => of({ ok: false, data: [] as SaborPorCategoria[] }))),
    }).subscribe({
      next: respuesta => {
        this.cargando.set(false);
        if (respuesta.productos.ok && respuesta.productos.data) this.productos.set(respuesta.productos.data);
        else this.error.set(respuesta.productos.mensaje || 'No se pudieron cargar los productos.');
        this.categorias.set(respuesta.categorias.data || []);
        this.saboresPorCategoria.set(respuesta.sabores.data || []);
      },
      error: () => { this.cargando.set(false); this.error.set('No se pudo cargar el catálogo.'); },
    });
  }
  imagenProducto(productoId: number): string | null { const fotos = this.productos().find(producto => producto.id === productoId)?.fotos || []; return fotos.find(foto => foto.principal)?.url || fotos[0]?.url || null; }
  fotosProducto(productoId: number): FotoProducto[] { return this.productos().find(producto => producto.id === productoId)?.fotos || []; }
  saboresCategoria(categoriaId: number, subcategoriaId?: number): string[] {
    const ids = new Set([categoriaId, ...(subcategoriaId ? [subcategoriaId] : [])]);
    return [...new Set(this.saboresPorCategoria().filter(item => ids.has(item.categoriaId)).flatMap(item => item.sabores))].sort((a,b) => a.localeCompare(b));
  }
  nombreSubcategoria(subcategoriaId?: number | null): string | null { return this.categorias().find(categoria => categoria.id === subcategoriaId)?.nombre || null; }
  presentacionesProducto(productoId: number): PresentacionProducto[] { return this.productos().find(producto => producto.id === productoId)?.presentaciones || []; }
  resumenCalificacion(productoId: number): { promedio: number; cantidad: number } | null {
    const producto = this.productos().find(item => item.id === productoId);
    return producto?.cantidadOpiniones ? { promedio: producto.calificacionPromedio, cantidad: producto.cantidadOpiniones } : null;
  }
  async guardarSabor(nombre: string, categoriaId: number): Promise<void> {
    const respuesta = await firstValueFrom(this.api.guardarSabor(nombre, categoriaId));
    if (!respuesta.ok || !respuesta.data) throw new Error(respuesta.mensaje || 'No se pudo guardar el sabor.');
    this.saboresPorCategoria.update(catalogo => {
      const actual = catalogo.find(item => item.categoriaId === categoriaId);
      if (!actual) return [...catalogo, { categoriaId, categoriaNombre: '', sabores: [respuesta.data!.nombre] }];
      return catalogo.map(item => item.categoriaId === categoriaId ? { ...item, sabores: [...new Set([...item.sabores, respuesta.data!.nombre])].sort((a,b) => a.localeCompare(b)) } : item);
    });
  }
  async guardarPublicacion(datos: PublicacionProducto, productoId?: number): Promise<Producto> {
    const respuesta = await firstValueFrom(this.api.guardarPublicacion(datos, productoId));
    if (!respuesta.ok || !respuesta.data) throw new Error(respuesta.mensaje || 'No se pudo guardar el producto.');
    this.actualizarProducto(respuesta.data); this.avisos.success(respuesta.mensaje || 'Producto guardado.');
    return respuesta.data;
  }
  async guardarFotos(productoId: number, urls: string[], eliminarIds: number[]): Promise<Producto> {
    const respuesta = await firstValueFrom(this.api.guardarFotos(productoId, urls.map(url => ({ url })), eliminarIds));
    if (!respuesta.ok || !respuesta.data) throw new Error(respuesta.mensaje || 'No se pudieron guardar las fotos.');
    this.actualizarProducto(respuesta.data); return respuesta.data;
  }
  private actualizarProducto(producto: Producto): void {
    this.productos.update(lista => lista.some(actual => actual.id === producto.id) ? lista.map(actual => actual.id === producto.id ? producto : actual) : [producto, ...lista]);
  }
  obtener(id: number): void { this.cargando.set(true); this.api.obtenerPorId(id).subscribe({ next: respuesta => { this.cargando.set(false); if (respuesta.ok && respuesta.data) { this.seleccionado.set(respuesta.data); this.actualizarProducto(respuesta.data); } }, error: () => this.cargando.set(false) }); }
  async eliminar(id: number): Promise<void> {
    if (!await this.confirmacion.confirmar('¿Eliminar este producto?')) return;
    this.api.eliminar(id).subscribe({ next: respuesta => { if (respuesta.ok) { this.avisos.success(respuesta.mensaje || 'Producto eliminado.'); this.productos.update(lista => lista.filter(producto => producto.id !== id)); } else this.avisos.error(respuesta.mensaje || 'No se pudo eliminar el producto.'); }, error: () => this.avisos.error('No se pudo eliminar el producto.') });
  }
}
