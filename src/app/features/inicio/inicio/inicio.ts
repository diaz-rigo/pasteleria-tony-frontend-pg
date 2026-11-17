import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductosStore } from '../../../store/productos/productos.store';
import { ConfiguracionStore } from '../../../store/configuracion/configuracion.store';
import { LucideCakeSlice } from '@lucide/angular';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, CurrencyPipe, LucideCakeSlice],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio implements OnInit {
  readonly productos = inject(ProductosStore);
  readonly config = inject(ConfiguracionStore);
  productImage(id: number): string | null {
    return this.productos.imagenProducto(id);
  }
  precioDesde(id: number): number | null {
    const precios = this.productos.presentacionesProducto(id).map(p => p.precio).filter(n => Number.isFinite(n) && n > 0);
    return precios.length ? Math.min(...precios) : null;
  }
  categoriaNombre(id: number): string | undefined {
    return this.productos.categorias().find(c => c.id === id)?.nombre;
  }
  heroButtonUrl(): string {
    const url = this.config.config()?.strCfgUrlBotonHero?.trim();
    if (!url || url === '/productos') return '/catalogo';
    if (url.startsWith('/') && !url.startsWith('//')) return url;
    return /^https?:\/\//i.test(url) ? url : '/catalogo';
  }
  heroButtonInternal(): boolean { return this.heroButtonUrl().startsWith('/'); }
  ngOnInit(): void {
    this.productos.cargar();
  }
}
