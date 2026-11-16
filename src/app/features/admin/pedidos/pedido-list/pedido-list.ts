import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Pedido } from '../../../../models/pedido.model';

@Component({
  selector: 'app-pedido-list',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './pedido-list.html',
  styleUrl: './pedido-list.css',
})
export class PedidoList {
  @Input() pedidos: Pedido[] = [];
  @Input() cargando = false;
  @Output() eliminar = new EventEmitter<number>();
}
