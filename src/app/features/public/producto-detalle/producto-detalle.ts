import { CurrencyPipe, DecimalPipe, DOCUMENT } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { LucideMessageCircle } from '@lucide/angular';
import { ConfiguracionStore } from '../../../store/configuracion/configuracion.store';
import { ProductosStore } from '../../../store/productos/productos.store';
import { CloudinaryImagePipe } from '../../../shared/pipes/cloudinary-image.pipe';
import { Producto } from '../../../models/producto.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-producto-detalle',
  imports: [CurrencyPipe, DecimalPipe, RouterLink, CloudinaryImagePipe, LucideMessageCircle],
  templateUrl: './producto-detalle.html',
  styleUrl: './producto-detalle.css',
})
export class ProductoDetalle implements OnInit {
  readonly store = inject(ProductosStore);
  readonly config = inject(ConfiguracionStore);
  private readonly route = inject(ActivatedRoute);
  private readonly document = inject(DOCUMENT);
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
    const mensaje = `Hola, me interesa ${nombre}. ¿Me pueden compartir las presentaciones disponibles, el precio y la disponibilidad?\n\nVi este producto en su catálogo: ${this.urlCompartirProducto()}`;
    return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}` : null;
  }
  private urlCompartirProducto(): string { return `${environment.apiUrl}/productos/share/${this.productId()}?modo=contacto`; }
}
