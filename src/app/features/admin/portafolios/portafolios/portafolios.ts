import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PortafoliosStore } from '../../../../store/portafolios/portafolios.store';
import { Portafolio } from '../../../../models/portafolio.model';
import { LucideAlertTriangle, LucideBriefcaseBusiness, LucideLoader2, LucidePencil, LucidePlus, LucideRefreshCw, LucideSave, LucideTrash2, LucideX } from '@lucide/angular';

@Component({ selector:'app-portafolios', imports:[ReactiveFormsModule,LucideAlertTriangle,LucideBriefcaseBusiness,LucideLoader2,LucidePencil,LucidePlus,LucideRefreshCw,LucideSave,LucideTrash2,LucideX], templateUrl:'./portafolios.html', styleUrl:'./portafolios.css' })
export class Portafolios implements OnInit {
  readonly store=inject(PortafoliosStore);
  readonly vistaMovil=signal<'lista'|'formulario'>('lista');
  readonly seleccionado=signal<Portafolio|null>(null);
  private readonly fb=inject(FormBuilder);
  readonly form=this.fb.nonNullable.group({
    strPorUrlImagen:['',[Validators.required,Validators.maxLength(500)]],
    strPorTitulo:['',[Validators.maxLength(200)]],
    strPorDescripcion:[''],
    strPorTipoEvento:['otro',Validators.required],
    strPorTipoProducto:['otro',Validators.required],
    blnPorDestacado:[false],
  });
  ngOnInit():void { this.store.cargar(); }
  nuevo():void { this.seleccionado.set(null);this.form.reset({strPorUrlImagen:'',strPorTitulo:'',strPorDescripcion:'',strPorTipoEvento:'otro',strPorTipoProducto:'otro',blnPorDestacado:false});this.vistaMovil.set('formulario'); }
  editar(item:Portafolio):void { this.seleccionado.set(item);this.form.reset({strPorUrlImagen:item.strPorUrlImagen,strPorTitulo:item.strPorTitulo||'',strPorDescripcion:item.strPorDescripcion||'',strPorTipoEvento:item.strPorTipoEvento||'otro',strPorTipoProducto:item.strPorTipoProducto||'otro',blnPorDestacado:item.blnPorDestacado??false});this.vistaMovil.set('formulario'); }
  cancelar():void { this.seleccionado.set(null);this.vistaMovil.set('lista'); }
  guardar():void { if(this.form.invalid){this.form.markAllAsTouched();return;}const actual=this.seleccionado();const data=this.form.getRawValue();if(actual?.intPorLlave)this.store.actualizar(actual.intPorLlave,data,()=>this.cancelar());else this.store.crear(data,()=>this.cancelar()); }
}
