import { Component, inject, OnInit } from '@angular/core';
import { PedidosStore } from '../../../../store/pedidos/pedidos.store';
import { PedidoList } from '../pedido-list/pedido-list';
import { Pedido } from '../../../../models/pedido.model';

@Component({
  selector: 'app-pedidos',
  imports: [PedidoList],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.css',
})
export class Pedidos implements OnInit {
  readonly store = inject(PedidosStore);
  ngOnInit(): void { this.store.cargar(); }
}
