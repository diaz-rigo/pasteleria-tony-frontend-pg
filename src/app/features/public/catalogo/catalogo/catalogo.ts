import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductosStore } from '../../../../store/productos/productos.store';
import { LucideSearch } from '@lucide/angular';
import { RouterLink } from '@angular/router';

@Component({ selector:'app-catalogo', imports:[FormsModule,LucideSearch,CurrencyPipe,DecimalPipe,RouterLink], templateUrl:'./catalogo.html', styleUrl:'./catalogo.css' })
export class Catalogo implements OnInit {
  readonly store=inject(ProductosStore);
  readonly busqueda=signal('');
  readonly filtro=signal('todos');
  readonly categoriasFiltro=computed(()=>[
    { id:'todos', nombre:'Todos' },
    ...this.store.visibles().map(c=>({id:`categoria-${c.id}`,nombre:c.nombre})),
    { id:'favoritos', nombre:'Favoritos' },
    { id:'disponibles', nombre:'Disponibles' },
  ]);
  readonly productosFiltrados=computed(()=>{
    const q=this.busqueda().trim().toLocaleLowerCase();
    return this.store.productos().filter(p=>{
      const coincide=!q||`${p.nombre} ${p.descripcion||''} ${p.ingredientes||''} ${p.sabor||''}`.toLocaleLowerCase().includes(q);
      const filtro=this.filtro();
      const idCategoria=Number(filtro.replace('categoria-',''));
      return coincide&&(filtro==='todos'||(filtro.startsWith('categoria-')&&p.categoria.id===idCategoria)||(filtro==='favoritos'&&p.destacado)||(filtro==='disponibles'&&p.disponibilidad==='disponible'));
    });
  });
  ngOnInit():void { this.store.cargar(); }
  disponibilidad(estado?:string):string { return estado==='agotado'?'Agotado':estado==='sobre_pedido'?'Sobre pedido':'Disponible'; }
  precioDesde(id:number):number|null { const precios=this.store.presentacionesProducto(id).map(p=>p.precio).filter(n=>Number.isFinite(n)&&n>0); return precios.length?Math.min(...precios):null; }
  medidasDisponibles(id:number):string { return [...new Set(this.store.presentacionesProducto(id).map(p=>`${p.cantidad} ${p.unidad}`))].join(' · '); }
  resumenCalificacion(id:number): {promedio:number;cantidad:number}|null { return this.store.resumenCalificacion(id); }
}
