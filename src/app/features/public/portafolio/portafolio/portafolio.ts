import { Component, inject, OnInit } from '@angular/core';
import { PortafoliosStore } from '../../../../store/portafolios/portafolios.store';
import { CloudinaryImagePipe } from '../../../../shared/pipes/cloudinary-image.pipe';

@Component({
  selector: 'app-portafolio',
  imports: [CloudinaryImagePipe],
  templateUrl: './portafolio.html',
  styleUrl: './portafolio.css',
})
export class Portafolio implements OnInit {
  readonly store = inject(PortafoliosStore);
  ngOnInit(): void { this.store.cargar(); }
}
