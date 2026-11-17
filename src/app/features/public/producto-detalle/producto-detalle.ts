import { CurrencyPipe, DecimalPipe, DOCUMENT } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { LucideMessageCircle, LucideShare2 } from '@lucide/angular';
import { ConfiguracionStore } from '../../../store/configuracion/configuracion.store';
import { ProductosStore } from '../../../store/productos/productos.store';
import { CloudinaryImagePipe } from '../../../shared/pipes/cloudinary-image.pipe';
import { Producto } from '../../../models/producto.model';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-producto-detalle',
  imports: [CurrencyPipe, DecimalPipe, RouterLink, CloudinaryImagePipe, LucideMessageCircle, LucideShare2],
  templateUrl: './producto-detalle.html',
  styleUrl: './producto-detalle.css',
})
export class ProductoDetalle implements OnInit {
  readonly store = inject(ProductosStore);
  readonly config = inject(ConfiguracionStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly toast = inject(ToastService);
  private readonly productId = toSignal(this.route.paramMap.pipe(map(params => Number(params.get('id')))), { initialValue: Number(this.route.snapshot.paramMap.get('id')) });
  readonly producto = computed(() => this.store.productos().find(p => p.id === this.productId()) || null);
  readonly relacionados = computed(() => this.store.productos().filter(p => p.categoria.id === this.producto()?.categoria.id && p.id !== this.productId()).slice(0, 4));
  fotoSeleccionada: string | null = null;

  ngOnInit(): void { this.store.cargar(); }
  imagenActual(): string | null { const fotos = this.producto()?.fotos || []; return (this.fotoSeleccionada && fotos.some(foto => foto.url === this.fotoSeleccionada) ? this.fotoSeleccionada : null) || fotos.find(foto => foto.principal)?.url || fotos[0]?.url || null; }
  disponibilidad(estado?: string): string { return estado === 'agotado' ? 'Agotado' : estado === 'sobre_pedido' ? 'Sobre pedido' : 'Disponible'; }
  telefono(): string | null { return this.config.telefonos().find(t => t.blnTelPrincipal)?.strTelNumero || this.config.telefonos()[0]?.strTelNumero || null; }
  whatsappUrl(nombre: string): string | null {
    let phone = this.telefono()?.replace(/\D/g, '') || '';
    if (phone.length === 10) phone = `52${phone}`;
    return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(`Hola, me interesa ${nombre}. ¿Me pueden compartir más información? ${this.urlProductoActual()}`)}` : null;
  }
  async compartirProducto(producto: Producto): Promise<void> {
    const url = this.urlProductoActual();
    const precios = producto.presentaciones.map(item => item.precio).filter(precio => Number.isFinite(precio) && precio > 0);
    const detalles = [
      producto.descripcion,
      producto.sabor ? `Sabor: ${producto.sabor}` : null,
      precios.length ? `Desde $${Math.min(...precios).toLocaleString('es-MX')} MXN` : null,
    ].filter((detalle): detalle is string => !!detalle);
    const texto = [`Conoce ${producto.nombre}`, ...detalles].join('\n');
    const compartir = this.document.defaultView?.navigator.share;
    if (compartir) {
      try {
        await this.document.defaultView!.navigator.share({ title: producto.nombre, text: texto, url });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
      }
    }
    try {
      const contenido = `${texto}\n${url}`;
      const portapapeles = this.document.defaultView?.navigator.clipboard;
      if (portapapeles) await portapapeles.writeText(contenido);
      else {
        const campo = this.document.createElement('textarea');
        campo.value = contenido;
        campo.style.position = 'fixed';
        campo.style.opacity = '0';
        this.document.body.appendChild(campo);
        campo.select();
        const copiado = this.document.execCommand('copy');
        campo.remove();
        if (!copiado) throw new Error('No se pudo copiar el enlace.');
      }
      this.toast.success('Información y enlace del producto copiados.');
    } catch {
      this.toast.error('No se pudo compartir el producto desde este navegador.');
    }
  }
  private urlProductoActual(): string {
    const ruta = this.router.serializeUrl(this.router.createUrlTree(['/producto', this.productId()]));
    return new URL(ruta, this.document.location?.origin || this.document.baseURI).toString();
  }
}
