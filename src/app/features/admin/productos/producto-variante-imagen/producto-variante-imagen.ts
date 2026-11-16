import { Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Producto } from '../../../../models/producto.model';
import { VarianteProducto } from '../../../../models/entities.model';
import { ProductosStore } from '../../../../store/productos/productos.store';

@Component({
  selector: 'app-producto-variante-imagen',
  imports: [FormsModule],
  templateUrl: './producto-variante-imagen.html',
  styleUrl: './producto-variante-imagen.css',
})
export class ProductoVarianteImagen {
  @Input({ required: true }) producto!: Producto;
  readonly store = inject(ProductosStore);
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
