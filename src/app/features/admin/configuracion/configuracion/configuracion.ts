import { Component, effect, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ConfiguracionStore } from '../../../../store/configuracion/configuracion.store';
import { Configuracion } from '../../../../models/configuracion.model';

@Component({
  selector: 'app-configuracion',
  imports: [ReactiveFormsModule],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css',
})
export class ConfiguracionAdmin implements OnInit {
  readonly store = inject(ConfiguracionStore);
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    strCfgNombreNegocio: [''],
    strCfgColorPrimario: ['#e4b500'],
    strCfgUrlLogo: [''],
    strCfgTextoPie: [''],
    strCfgTituloHero: [''],
    strCfgSubtituloHero: [''],
    strCfgTextoBotonHero: [''],
    strCfgUrlBotonHero: ['/catalogo'],
    strCfgUrlImagenHero: [''],
    blnCfgMostrarTituloHero: [true],
    blnCfgMostrarSubtituloHero: [true],
    blnCfgMostrarImagenHero: [true],
    blnCfgMostrarBotonHero: [true],
    strCfgCalle: [''],
    strCfgCiudad: [''],
    strCfgEstado: [''],
    strCfgCodigoPostal: [''],
    strCfgPais: [''],
    strCfgUrlMapa: [''],
    strCfgTituloMeta: [''],
    strCfgDescripcionMeta: [''],
  });

  private readonly sincronizarFormulario = effect(() => {
    const configuracion = this.store.config();
    if (configuracion) this.form.patchValue(configuracion);
  });

  ngOnInit(): void {
    this.store.cargar();
  }

  guardar(): void {
    this.store.guardar(this.form.getRawValue(), () => {});
  }
}
