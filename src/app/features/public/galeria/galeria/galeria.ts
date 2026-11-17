import { Component, computed, inject, OnInit } from '@angular/core';
import { GaleriasStore } from '../../../../store/galerias/galerias.store';
import { CloudinaryImagePipe } from '../../../../shared/pipes/cloudinary-image.pipe';

@Component({
  selector: 'app-galeria',
  imports: [CloudinaryImagePipe],
  templateUrl: './galeria.html',
  styleUrl: './galeria.css',
})
export class Galeria implements OnInit {
  readonly store = inject(GaleriasStore);
  readonly galeriasPublicas = computed(() => this.store.items().filter(g => g.blnGalActivo !== false));
  ngOnInit(): void { this.store.cargar(); }
}
