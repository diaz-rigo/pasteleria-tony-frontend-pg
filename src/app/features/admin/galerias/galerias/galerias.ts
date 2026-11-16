import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { GaleriasStore } from '../../../../store/galerias/galerias.store';
import { Galeria } from '../../../../models/galeria.model';
import { ProductosStore } from '../../../../store/productos/productos.store';

@Component({ selector:'app-galerias', imports:[FormsModule,ReactiveFormsModule], templateUrl:'./galerias.html', styleUrl:'./galerias.css' })
export class Galerias implements OnInit {
  readonly store=inject(GaleriasStore);
  readonly productos=inject(ProductosStore);
  readonly vistaMovil=signal<'lista'|'formulario'>('lista');
  readonly seleccionado=signal<Galeria|null>(null);
  readonly fb=inject(FormBuilder);
  readonly form=this.fb.nonNullable.group({
    strGalTitulo:['',[Validators.required,Validators.maxLength(200)]],
    strGalDescripcion:[''],
    blnGalActivo:[true],
    blnGalDestacado:[false],
    intProLlave:[null as number|null],
    strGalSaborRelacionado:[''],
  });
  imagenUrl='';
  ngOnInit():void { this.store.cargar();this.productos.cargar(); }
  nuevo():void { this.seleccionado.set(null);this.imagenUrl='';this.form.reset({strGalTitulo:'',strGalDescripcion:'',blnGalActivo:true,blnGalDestacado:false,intProLlave:null,strGalSaborRelacionado:''});this.vistaMovil.set('formulario'); }
  editar(item:Galeria):void { this.seleccionado.set(item);this.imagenUrl=this.store.imagenesDe(item.intGalLlave||0)[0]?.strImgUrl||'';this.form.reset({strGalTitulo:item.strGalTitulo,strGalDescripcion:item.strGalDescripcion||'',blnGalActivo:item.blnGalActivo??true,blnGalDestacado:item.blnGalDestacado??false,intProLlave:item.intProLlave||null,strGalSaborRelacionado:item.strGalSaborRelacionado||''});this.vistaMovil.set('formulario'); }
  cancelar():void { this.seleccionado.set(null);this.vistaMovil.set('lista'); }
  guardar():void {
    if(this.form.invalid){this.form.markAllAsTouched();return;}
    const actual=this.seleccionado();
    const raw=this.form.getRawValue();
    const data={...raw,intProLlave:raw.intProLlave??undefined};
    if(actual?.intGalLlave){this.store.actualizar(actual.intGalLlave,data,()=>this.store.guardarImagen(actual.intGalLlave!,this.imagenUrl,()=>this.cancelar()));}
    else this.store.crear(data,registro=>registro?.intGalLlave?this.store.guardarImagen(registro.intGalLlave,this.imagenUrl,()=>this.cancelar()):this.cancelar());
  }
}
