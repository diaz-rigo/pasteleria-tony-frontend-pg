import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ConfiguracionStore } from '../../../store/configuracion/configuracion.store';
import { ProductosStore } from '../../../store/productos/productos.store';

@Component({
  selector: 'app-producto-detalle',
  imports: [CurrencyPipe, DecimalPipe, RouterLink],
  templateUrl: './producto-detalle.html',
  styleUrl: './producto-detalle.css',
})
export class ProductoDetalle implements OnInit {
  readonly store = inject(ProductosStore);
  readonly config = inject(ConfiguracionStore);
  private readonly route = inject(ActivatedRoute);
  private readonly productId = toSignal(this.route.paramMap.pipe(map(params => Number(params.get('id')))), { initialValue: Number(this.route.snapshot.paramMap.get('id')) });
  readonly producto = computed(() => this.store.productos().find(p => p.intProLlave === this.productId()) || null);
  readonly relacionados = computed(() => this.store.productos().filter(p => p.intCtgLlave === this.producto()?.intCtgLlave && p.intProLlave !== this.productId()).slice(0, 4));

  ngOnInit(): void { this.store.cargar(); }
  categoriaNombre(id?: number): string { return this.store.categorias().find(c => c.intCtgLlave === id)?.strCtgNombre || 'Hecho en casa'; }
  tallas(id: number) { return this.store.tallasProducto(id).filter(t => t.strTalEstadoDisponibilidad !== 'out_of_stock'); }
  variantes(id: number) { return this.store.variantesProducto(id); }
  detalleVariante(v: { strVarTextura?: string; strVarForma?: string; strVarColor?: string }): string {
    return [v.strVarTextura, v.strVarForma, v.strVarColor].filter(value => !!value).join(' · ');
  }
  disponibilidad(estado?: string): string { return estado === 'out_of_stock' ? 'Agotado' : estado === 'on_demand' ? 'Sobre pedido' : 'Disponible'; }
  telefono(): string | null { return this.config.telefonos().find(t => t.blnTelPrincipal)?.strTelNumero || this.config.telefonos()[0]?.strTelNumero || null; }
  whatsappUrl(nombre: string): string | null {
    const phone = this.telefono()?.replace(/\D/g, '');
    return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(`Hola, me interesa ${nombre}. ¿Me pueden compartir más información?`)}` : null;
  }
  rating(id: number) { return this.store.resumenCalificacion(id); }
}
