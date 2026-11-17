import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Pedido } from '../../../../models/pedido.model';
import { LucideLoader2, LucideShoppingBag, LucideTrash2 } from '@lucide/angular';

@Component({
  selector: 'app-pedido-list',
  imports: [CurrencyPipe, DatePipe, LucideLoader2, LucideShoppingBag, LucideTrash2],
  templateUrl: './pedido-list.html',
  styleUrl: './pedido-list.css',
})
export class PedidoList {
  @Input() pedidos: Pedido[] = [];
  @Input() cargando = false;
  @Output() eliminar = new EventEmitter<number>();
}
