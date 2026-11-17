import { Component, Input, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Producto } from '../../../../models/producto.model';
import { VarianteProducto } from '../../../../models/entities.model';
import { ProductosStore } from '../../../../store/productos/productos.store';
import { ProductosService } from '../../../../store/productos/productos.service';

@Component({
  selector: 'app-producto-variante-imagen',
  imports: [FormsModule],
  templateUrl: './producto-variante-imagen.html',
  styleUrl: './producto-variante-imagen.css',
})
export class ProductoVarianteImagen {
  @Input({ required: true }) producto!: Producto;
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
  urlImagen: Record<number, string> = {};

  variantes(): VarianteProducto[] { return this.store.variantesProducto(this.producto.intProLlave || 0); }
  imagenes(id: number) { return this.store.imagenes().filter(image => image.intVarLlave === id); }
  nombreVariante(variant: VarianteProducto): string { return [variant.strVarSabor, variant.strVarForma].filter(Boolean).join(' · ') || 'Variante'; }

  async subirImagen(event: Event, varianteId = -1): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.errorCarga.update(errors => ({ ...errors, [varianteId]: '' }));
    if (!file.type.startsWith('image/')) {
      this.errorCarga.update(errors => ({ ...errors, [varianteId]: 'Elige un archivo de imagen.' })); input.value = ''; return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.errorCarga.update(errors => ({ ...errors, [varianteId]: 'La imagen debe pesar menos de 10 MB.' })); input.value = ''; return;
    }
    this.subiendo.update(items => ({ ...items, [varianteId]: true }));
    try {
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
      if (varianteId > 0) this.store.crearImagenVariante({ intVarLlave: varianteId, strImaUrl: result.secure_url }, () => input.value = '');
      else this.urlImagen[-1] = result.secure_url;
      input.value = '';
    } catch (error) {
      const apiMessage = (error as { error?: { mensaje?: string } })?.error?.mensaje;
      const message = apiMessage || (error instanceof Error ? error.message : 'Error al subir la imagen.');
      this.errorCarga.update(items => ({ ...items, [varianteId]: message }));
    } finally {
      this.subiendo.update(items => ({ ...items, [varianteId]: false }));
    }
  }

  crearVariante(): void {
    if (!this.sabor.trim() || !this.color.trim() || !this.textura.trim() || !this.forma.trim()) return;
    this.store.crearVariante({
      intProLlave: this.producto.intProLlave!, strVarSabor: this.sabor.trim(), strVarColor: this.color.trim(),
      strVarTextura: this.textura.trim(), strVarForma: this.forma.trim(), strVarDescripcion: this.descripcion.trim(),
      strVarEstadoDisponibilidad: 'available',
    }, variant => {
      const url = this.urlImagen[-1]?.trim();
      if (variant?.intVarLlave && url) this.store.crearImagenVariante({ intVarLlave: variant.intVarLlave, strImaUrl: url }, () => this.limpiarVariante());
      else this.limpiarVariante();
    });
  }

  agregarImagen(variant: VarianteProducto): void {
    const url = this.urlImagen[variant.intVarLlave || 0]?.trim();
    if (!url || !variant.intVarLlave) return;
    this.store.crearImagenVariante({ intVarLlave: variant.intVarLlave, strImaUrl: url }, () => this.urlImagen[variant.intVarLlave!] = '');
  }

  private limpiarVariante(): void {
    this.sabor = ''; this.color = ''; this.textura = ''; this.forma = ''; this.descripcion = '';
    this.urlImagen[-1] = ''; this.agregandoVariante = false;
  }
}
