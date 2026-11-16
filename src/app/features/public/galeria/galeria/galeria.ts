import { Component, computed, inject, OnInit } from '@angular/core';
import { GaleriasStore } from '../../../../store/galerias/galerias.store';

@Component({
  selector: 'app-galeria',
  imports: [],
  templateUrl: './galeria.html',
  styleUrl: './galeria.css',
})
export class Galeria implements OnInit {
  readonly store = inject(GaleriasStore);
  readonly galeriasPublicas = computed(() => this.store.items().filter(g => g.blnGalActivo !== false));
  ngOnInit(): void { this.store.cargar(); }
}
