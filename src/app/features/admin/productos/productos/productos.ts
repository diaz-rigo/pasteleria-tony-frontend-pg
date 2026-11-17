import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ProductosStore } from '../../../../store/productos/productos.store';
import { ProductosService, FirmaCargaFoto } from '../../../../store/productos/productos.service';
import { CategoriasStore } from '../../../../store/categorias/categorias.store';
import { ProductoList } from '../producto-list/producto-list';
import { DatosFormularioProducto, ProductoForm } from '../producto-form/producto-form';
import { FotoProducto, Producto } from '../../../../models/producto.model';
import { LucideAlertTriangle, LucidePlus, LucideRefreshCw } from '@lucide/angular';

interface RespuestaCargaFoto { secure_url: string; }

@Component({ selector: 'app-productos', imports: [ProductoList, ProductoForm, LucideAlertTriangle, LucidePlus, LucideRefreshCw], templateUrl: './productos.html', styleUrl: './productos.css' })
export class Productos implements OnInit {
  readonly productos = inject(ProductosStore);
  readonly categorias = inject(CategoriasStore);
  private readonly http = inject(HttpClient);
  private readonly api = inject(ProductosService);
  mostrarFormulario = false;
  guardando = false;
  readonly vistaMovil = signal<'lista' | 'formulario'>('lista');
  productoSeleccionado: Producto | null = null;
  categoriaSeleccionada = 0;
  subcategoriaSeleccionada?: number;
  fotosExistentes: FotoProducto[] = [];
  private productoBorradorId: number | null = null;

  ngOnInit(): void { this.productos.cargar(); this.categorias.cargar(); }
  nuevo(): void { this.productoBorradorId = null; this.productoSeleccionado = null; this.categoriaSeleccionada = 0; this.subcategoriaSeleccionada = undefined; this.fotosExistentes = []; this.mostrarFormulario = true; this.vistaMovil.set('formulario'); }
  editar(producto: Producto): void { this.productoBorradorId = null; this.productoSeleccionado = producto; this.categoriaSeleccionada = producto.categoria.id; this.subcategoriaSeleccionada = producto.subcategoria?.id; this.fotosExistentes = producto.fotos; this.mostrarFormulario = true; this.vistaMovil.set('formulario'); }
  cerrarFormulario(): void { this.mostrarFormulario = false; this.productoSeleccionado = null; this.productoBorradorId = null; this.categoriaSeleccionada = 0; this.subcategoriaSeleccionada = undefined; this.fotosExistentes = []; this.vistaMovil.set('lista'); }
  actualizarCategoriaSeleccionada(evento: { categoriaId: number; subcategoriaId?: number }): void { this.categoriaSeleccionada = evento.categoriaId; this.subcategoriaSeleccionada = evento.subcategoriaId; }
  async crearSabor(evento: { nombre: string; categoriaId: number }): Promise<void> { try { await this.productos.guardarSabor(evento.nombre, evento.categoriaId); } catch (error) { this.productos.error.set(error instanceof Error ? error.message : 'No se pudo agregar el sabor.'); } }

  async guardar(datos: DatosFormularioProducto): Promise<void> {
    if (this.guardando) return;
    this.guardando = true;
    try {
      const idActual = this.productoSeleccionado?.id || this.productoBorradorId || undefined;
      const producto = await this.productos.guardarPublicacion(datos.publicacion, idActual);
      if (!this.productoSeleccionado) this.productoBorradorId = producto.id;
      for (const foto of datos.archivos) {
        if (foto.urlCargada) continue;
        const respuestaFirma = await firstValueFrom(this.api.firmarCargaFoto(producto.id));
        if (!respuestaFirma.ok || !respuestaFirma.data) throw new Error(respuestaFirma.mensaje || 'No se pudo preparar la carga de fotos.');
        const firma: FirmaCargaFoto = respuestaFirma.data;
        const carga = new FormData(); carga.append('file', foto.archivo); carga.append('api_key', firma.claveApi); carga.append('timestamp', String(firma.marcaTemporal)); carga.append('folder', firma.carpeta); carga.append('signature', firma.firma);
        const subida = await firstValueFrom(this.http.post<RespuestaCargaFoto>(`https://api.cloudinary.com/v1_1/${firma.nombreNube}/image/upload`, carga));
        foto.urlCargada = subida.secure_url;
      }
      if (datos.archivos.length || datos.fotosEliminar.length) {
        await this.productos.guardarFotos(producto.id, datos.archivos.map(foto => foto.urlCargada).filter((url): url is string => !!url), datos.fotosEliminar);
      }
      datos.archivos.forEach(foto => URL.revokeObjectURL(foto.vistaPrevia));
      this.cerrarFormulario();
    } catch (error) {
      this.productos.error.set(error instanceof Error ? error.message : 'No se pudieron guardar los cambios. Puedes volver a intentarlo.');
    } finally { this.guardando = false; }
  }
}
