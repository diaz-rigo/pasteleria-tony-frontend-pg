import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { GaleriasStore } from '../../../../store/galerias/galerias.store';
import { Galeria } from '../../../../models/galeria.model';
import { ProductosStore } from '../../../../store/productos/productos.store';
import { LucideAlertTriangle, LucideImages, LucideLoader2, LucidePencil, LucidePlus, LucideRefreshCw, LucideSave, LucideTrash2, LucideX } from '@lucide/angular';
import { SelectorImagen } from '../../../../shared/components/selector-imagen/selector-imagen';
import { SubidaImagenService } from '../../../../shared/services/subida-imagen.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';

@Component({ selector:'app-galerias', imports:[ReactiveFormsModule,SelectorImagen,LucideAlertTriangle,LucideImages,LucideLoader2,LucidePencil,LucidePlus,LucideRefreshCw,LucideSave,LucideTrash2,LucideX], templateUrl:'./galerias.html', styleUrl:'./galerias.css' })
export class Galerias implements OnInit {
  readonly store=inject(GaleriasStore);
  readonly productos=inject(ProductosStore);
  readonly vistaMovil=signal<'lista'|'formulario'>('lista');
  readonly seleccionado=signal<Galeria|null>(null);
  readonly fb=inject(FormBuilder);
  private readonly subidaImagen=inject(SubidaImagenService);
  private readonly toast=inject(ToastService);
  readonly form=this.fb.nonNullable.group({
    strGalTitulo:['',[Validators.required,Validators.maxLength(200)]],
    strGalDescripcion:[''],
    blnGalActivo:[true],
    blnGalDestacado:[false],
    intProLlave:[null as number|null],
    strGalSaborRelacionado:[''],
  });
  imagenUrl='';
  archivoPortada:File|null=null;
  guardando=false;
  ngOnInit():void { this.store.cargar();this.productos.cargar(); }
  nuevo():void { this.seleccionado.set(null);this.imagenUrl='';this.archivoPortada=null;this.form.reset({strGalTitulo:'',strGalDescripcion:'',blnGalActivo:true,blnGalDestacado:false,intProLlave:null,strGalSaborRelacionado:''});this.vistaMovil.set('formulario'); }
  editar(item:Galeria):void { this.seleccionado.set(item);this.imagenUrl=this.store.imagenesDe(item.intGalLlave||0)[0]?.strImgUrl||'';this.archivoPortada=null;this.form.reset({strGalTitulo:item.strGalTitulo,strGalDescripcion:item.strGalDescripcion||'',blnGalActivo:item.blnGalActivo??true,blnGalDestacado:item.blnGalDestacado??false,intProLlave:item.intProLlave||null,strGalSaborRelacionado:item.strGalSaborRelacionado||''});this.vistaMovil.set('formulario'); }
  cancelar():void { this.seleccionado.set(null);this.archivoPortada=null;this.vistaMovil.set('lista'); }
  cambiarPortada(archivo:File|null):void { this.archivoPortada=archivo;if(!archivo)this.imagenUrl=''; }
  async guardar():Promise<void> {
    if(this.form.invalid||this.guardando){this.form.markAllAsTouched();return;}
    if(!this.imagenUrl&&!this.archivoPortada){this.toast.error('Selecciona una imagen de portada.');return;}
    this.guardando=true;
    try { if(this.archivoPortada)this.imagenUrl=await this.subidaImagen.subir(this.archivoPortada,'galerias'); }
    catch(error){this.toast.error(error instanceof Error?error.message:'No se pudo subir la portada.');this.guardando=false;return;}
    const actual=this.seleccionado();
    const raw=this.form.getRawValue();
    const data={...raw,intProLlave:raw.intProLlave??undefined};
    if(actual?.intGalLlave){this.store.actualizar(actual.intGalLlave,data,()=>this.store.guardarImagen(actual.intGalLlave!,this.imagenUrl,()=>this.cancelar()));}
    else this.store.crear(data,registro=>registro?.intGalLlave?this.store.guardarImagen(registro.intGalLlave,this.imagenUrl,()=>this.cancelar()):this.cancelar());
    this.guardando=false;
  }
}
