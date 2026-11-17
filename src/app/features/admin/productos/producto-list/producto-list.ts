import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';
import { Producto } from '../../../../models/producto.model';
import { LucideLoader2, LucidePackage, LucidePencil, LucideTrash2 } from '@lucide/angular';

@Component({
  selector: 'app-producto-list',
  imports: [NgClass, LucideLoader2, LucidePackage, LucidePencil, LucideTrash2],
  templateUrl: './producto-list.html',
  styleUrl: './producto-list.css',
})
export class ProductoList {
  @Input() productos: Producto[] = [];
  @Input() cargando = false;
  @Input() modoCompacto = false;
  @Output() editar = new EventEmitter<Producto>();
  @Output() eliminar = new EventEmitter<number>();
  disponibilidad(estado: Producto['disponibilidad']): string { return estado === 'agotado' ? 'Agotado' : estado === 'sobre_pedido' ? 'Sobre pedido' : 'Disponible'; }
}
