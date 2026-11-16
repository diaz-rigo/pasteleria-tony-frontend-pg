import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductosStore } from '../../../../store/productos/productos.store';
import { LucideSearch } from '@lucide/angular';

@Component({ selector:'app-catalogo', imports:[FormsModule,LucideSearch,CurrencyPipe,DecimalPipe], templateUrl:'./catalogo.html', styleUrl:'./catalogo.css' })
export class Catalogo implements OnInit {
  readonly store=inject(ProductosStore);
  readonly busqueda=signal('');
  readonly filtro=signal('todos');
  readonly categoriasFiltro=computed(()=>[
    { id:'todos', nombre:'Todos' },
    ...this.store.visibles().map(c=>({id:`categoria-${c.intCtgLlave}`,nombre:c.strCtgNombre})),
    { id:'favoritos', nombre:'Favoritos' },
    { id:'disponibles', nombre:'Disponibles' },
  ]);
  readonly productosFiltrados=computed(()=>{
    const q=this.busqueda().trim().toLocaleLowerCase();
    return this.store.productos().filter(p=>{
      const coincide=!q||`${p.strProNombre} ${p.strProDescripcion||''} ${p.strProIngredientes}`.toLocaleLowerCase().includes(q);
      const filtro=this.filtro();
      const idCategoria=Number(filtro.replace('categoria-',''));
      return coincide&&(filtro==='todos'||(filtro.startsWith('categoria-')&&p.intCtgLlave===idCategoria)||(filtro==='favoritos'&&p.blnProDestacado)||(filtro==='disponibles'&&p.strProEstadoDisponibilidad==='available'));
    });
  });
  ngOnInit():void { this.store.cargar(); }
  disponibilidad(estado?:string):string { return estado==='out_of_stock'?'Agotado':estado==='on_demand'?'Sobre pedido':'Disponible'; }
  categoriaNombre(id:number):string { return this.store.categorias().find(c=>c.intCtgLlave===id)?.strCtgNombre||'Hecho en casa'; }
  precioDesde(id:number):number|null { const precios=this.store.tallasProducto(id).map(t=>Number(t.decTalPrecio)).filter(n=>Number.isFinite(n)&&n>0); return precios.length?Math.min(...precios):null; }
  medidasDisponibles(id:number):string { return [...new Set(this.store.tallasProducto(id).filter(t=>t.strTalEstadoDisponibilidad!=='out_of_stock').map(t=>String(t.decTalMedida)))].join(' · '); }
  resumenCalificacion(id:number): {promedio:number;cantidad:number}|null { return this.store.resumenCalificacion(id); }
}
