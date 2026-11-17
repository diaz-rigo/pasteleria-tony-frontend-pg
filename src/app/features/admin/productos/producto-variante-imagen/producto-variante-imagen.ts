import { Component, EventEmitter, Input, OnDestroy, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideImagePlus, LucidePlus, LucideSave, LucideX } from '@lucide/angular';
import { firstValueFrom } from 'rxjs';
import { Producto } from '../../../../models/producto.model';
import { VarianteProducto } from '../../../../models/entities.model';
import { ProductosStore } from '../../../../store/productos/productos.store';
import { ProductosService } from '../../../../store/productos/productos.service';

interface ArchivoPendiente { file: File; previewUrl: string; uploadedUrl?: string; }

@Component({
  selector: 'app-producto-variante-imagen',
  imports: [FormsModule, LucideImagePlus, LucidePlus, LucideSave, LucideX],
  templateUrl: './producto-variante-imagen.html',
  styleUrl: './producto-variante-imagen.css',
})
export class ProductoVarianteImagen implements OnDestroy {
  @Input({ required: true }) producto!: Producto;
  @Output() trabajando = new EventEmitter<boolean>();
  readonly store = inject(ProductosStore);
  private readonly productosService = inject(ProductosService);
  readonly subiendo = signal<Record<number, boolean>>({});
  readonly errorCarga = signal<Record<number, string>>({});
  varianteAbierta: number | null = null;
  agregandoVariante = false;
  sabor = '';
  color = '';
  textura = '';
  forma = '';
  descripcion = '';
  archivosPendientes: Record<number, ArchivoPendiente[]> = {};

  variantes(): VarianteProducto[] { return this.store.variantesProducto(this.producto.intProLlave || 0); }
  imagenes(id: number) { return this.store.imagenes().filter(image => image.intVarLlave === id); }
  pendientes(id: number): ArchivoPendiente[] { return this.archivosPendientes[id] || []; }
  nombreVariante(variant: VarianteProducto): string { return [variant.strVarSabor, variant.strVarForma].filter(Boolean).join(' · ') || 'Variante'; }

  seleccionarImagen(event: Event, varianteId = -1): void {
    const input = event.target as HTMLInputElement;
    for (const file of Array.from(input.files || [])) {
      if (!file.type.startsWith('image/')) {
        this.mensaje(varianteId, 'Elige solo archivos de imagen.'); continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        this.mensaje(varianteId, `${file.name} supera el máximo de 10 MB.`); continue;
      }
      const staged = this.archivosPendientes[varianteId] || [];
      this.archivosPendientes[varianteId] = [...staged, { file, previewUrl: URL.createObjectURL(file) }];
      this.errorCarga.update(items => ({ ...items, [varianteId]: '' }));
    }
    input.value = '';
  }

  quitarPendiente(id: number, file: ArchivoPendiente): void {
    if (this.subiendo()[id] || file.uploadedUrl) return;
    URL.revokeObjectURL(file.previewUrl);
    this.archivosPendientes[id] = this.pendientes(id).filter(item => item !== file);
  }

  crearVariante(): void {
    if (!this.sabor.trim() || !this.color.trim() || !this.textura.trim() || !this.forma.trim() || this.subiendo()[-1]) return;
    this.subiendo.update(items => ({ ...items, [-1]: true }));
    this.trabajando.emit(true);
    this.store.crearVariante({
      intProLlave: this.producto.intProLlave!, strVarSabor: this.sabor.trim(), strVarColor: this.color.trim(),
      strVarTextura: this.textura.trim(), strVarForma: this.forma.trim(), strVarDescripcion: this.descripcion.trim(),
      strVarEstadoDisponibilidad: 'available',
    }, variant => {
      if (!variant?.intVarLlave) { this.subiendo.update(items => ({ ...items, [-1]: false })); this.trabajando.emit(false); return; }
      this.subiendo.update(items => ({ ...items, [-1]: false }));
      const staged = this.archivosPendientes[-1] || [];
      delete this.archivosPendientes[-1];
      this.archivosPendientes[variant.intVarLlave] = staged;
      this.limpiarCamposVariante();
      this.varianteAbierta = variant.intVarLlave;
      if (staged.length) void this.guardarPendientes(variant.intVarLlave);
      else this.trabajando.emit(false);
    });
  }

  async guardarImagenes(variant: VarianteProducto): Promise<void> {
    if (!variant.intVarLlave || !this.pendientes(variant.intVarLlave).length) return;
    await this.guardarPendientes(variant.intVarLlave);
  }

  private async guardarPendientes(varianteId: number): Promise<void> {
    if (this.subiendo()[varianteId]) return;
    this.subiendo.update(items => ({ ...items, [varianteId]: true }));
    this.trabajando.emit(true);
    this.errorCarga.update(items => ({ ...items, [varianteId]: '' }));
    try {
      for (const staged of [...this.pendientes(varianteId)]) {
        staged.uploadedUrl ||= await this.subirACloudinary(staged.file);
        await this.store.crearImagenVariante({ intVarLlave: varianteId, strImaUrl: staged.uploadedUrl });
        URL.revokeObjectURL(staged.previewUrl);
        this.archivosPendientes[varianteId] = this.pendientes(varianteId).filter(item => item !== staged);
      }
    } catch (error) {
      const apiMessage = (error as { error?: { mensaje?: string } })?.error?.mensaje;
      const message = apiMessage || (error instanceof Error ? error.message : 'No se pudieron guardar todas las imágenes.');
      this.mensaje(varianteId, `${message} Puedes reintentar; las imágenes ya cargadas no se subirán otra vez.`);
    } finally {
      this.subiendo.update(items => ({ ...items, [varianteId]: false }));
      this.trabajando.emit(false);
    }
  }

  private async subirACloudinary(file: File): Promise<string> {
    const signed = await firstValueFrom(this.productosService.firmarSubidaImagen(this.producto.intProLlave || 0));
    if (!signed.ok || !signed.data) throw new Error(signed.mensaje || 'No se pudo iniciar la carga segura.');
    const payload = new FormData();
    payload.append('file', file);
    payload.append('api_key', signed.data.apiKey);
    payload.append('timestamp', String(signed.data.timestamp));
    payload.append('folder', signed.data.folder);
    payload.append('signature', signed.data.signature);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${signed.data.cloudName}/image/upload`, { method: 'POST', body: payload });
    const result = await response.json() as { secure_url?: string; error?: { message?: string } };
    if (!response.ok || !result.secure_url) throw new Error(result.error?.message || 'No se pudo subir la imagen.');
    return result.secure_url;
  }

  cancelarNuevaVariante(): void {
    this.limpiarPendientes(-1);
    this.limpiarCamposVariante();
    this.errorCarga.update(items => ({ ...items, [-1]: '' }));
  }

  private limpiarCamposVariante(): void {
    this.sabor = ''; this.color = ''; this.textura = ''; this.forma = ''; this.descripcion = '';
    this.agregandoVariante = false;
  }

  private limpiarPendientes(id: number): void {
    for (const staged of this.pendientes(id)) URL.revokeObjectURL(staged.previewUrl);
    delete this.archivosPendientes[id];
  }

  private mensaje(id: number, message: string): void { this.errorCarga.update(items => ({ ...items, [id]: message })); }

  ngOnDestroy(): void { Object.keys(this.archivosPendientes).forEach(id => this.limpiarPendientes(Number(id))); }
}
