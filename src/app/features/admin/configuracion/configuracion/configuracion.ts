import { Component, effect, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ConfiguracionStore } from '../../../../store/configuracion/configuracion.store';
import { Configuracion } from '../../../../models/configuracion.model';
import { LucideSave, LucideUndo2 } from '@lucide/angular';
import { SelectorImagen } from '../../../../shared/components/selector-imagen/selector-imagen';
import { SubidaImagenService } from '../../../../shared/services/subida-imagen.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-configuracion',
  imports: [ReactiveFormsModule, SelectorImagen, LucideSave, LucideUndo2],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css',
})
export class ConfiguracionAdmin implements OnInit {
  readonly store = inject(ConfiguracionStore);
  private fb = inject(FormBuilder);
  private readonly subidaImagen=inject(SubidaImagenService);
  private readonly toast=inject(ToastService);
  archivoLogo:File|null=null;
  archivoHero:File|null=null;
  guardando=false;

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
    void this.guardarConfiguracion();
  }

  async guardarConfiguracion():Promise<void> {
    if(this.guardando)return;
    this.guardando=true;
    try {
      const datos=this.form.getRawValue();
      if(this.archivoLogo)datos.strCfgUrlLogo=await this.subidaImagen.subir(this.archivoLogo,'configuracion');
      if(this.archivoHero)datos.strCfgUrlImagenHero=await this.subidaImagen.subir(this.archivoHero,'configuracion');
      this.form.patchValue(datos);
      this.store.guardar(datos,()=>{this.archivoLogo=null;this.archivoHero=null;});
    } catch(error) { this.toast.error(error instanceof Error?error.message:'No se pudieron subir las imágenes.'); }
    finally { this.guardando=false; }
  }

  cambiarLogo(archivo:File|null):void { this.archivoLogo=archivo;if(!archivo)this.form.controls.strCfgUrlLogo.setValue(''); }
  cambiarImagenHero(archivo:File|null):void { this.archivoHero=archivo;if(!archivo)this.form.controls.strCfgUrlImagenHero.setValue(''); }
}
