import { Component, inject, OnInit } from '@angular/core';
import { PortafoliosStore } from '../../../../store/portafolios/portafolios.store';

@Component({
  selector: 'app-portafolio',
  imports: [],
  templateUrl: './portafolio.html',
  styleUrl: './portafolio.css',
})
export class Portafolio implements OnInit {
  readonly store = inject(PortafoliosStore);
  ngOnInit(): void { this.store.cargar(); }
}
