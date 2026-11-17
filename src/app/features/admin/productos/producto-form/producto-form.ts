import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Categoria } from '../../../../models/categoria.model';
import { FotoProducto, PresentacionPublicacion, Producto, PublicacionProducto, UnidadPresentacion } from '../../../../models/producto.model';
import { LucideSave, LucideX, LucidePlus, LucideTrash2, LucideImage } from '@lucide/angular';

export interface DatosFormularioProducto {
  publicacion: PublicacionProducto;
  archivos: Array<{ archivo: File; vistaPrevia: string; urlCargada?: string }>;
  fotosEliminar: number[];
}
interface FilaPresentacion extends PresentacionPublicacion { llaveLocal: number; }

@Component({ selector: 'app-producto-form', imports: [FormsModule, LucideSave, LucideX, LucidePlus, LucideTrash2, LucideImage], templateUrl: './producto-form.html', styleUrl: './producto-form.css' })
export class ProductoForm implements OnChanges, OnDestroy {
  @Input() producto: Producto | null = null;
  @Input() categorias: Categoria[] = [];
  @Input() saboresDisponibles: string[] = [];
  @Input() imagenesExistentes: FotoProducto[] = [];
  @Input() bloquearAcciones = false;
  @Output() guardar = new EventEmitter<DatosFormularioProducto>();
  @Output() cancelar = new EventEmitter<void>();
  @Output() crearSabor = new EventEmitter<{ nombre: string; categoriaId: number }>();
  @Output() categoriaCambio = new EventEmitter<{ categoriaId: number; subcategoriaId?: number }>();
  nombre = ''; marca = 'Pastelería Tony'; categoria = 0; subcategoria: number | null = null; sabor = '';
  ingredientes = ''; descripcion = ''; destacado = false;
  presentaciones: FilaPresentacion[] = [];
  archivos: DatosFormularioProducto['archivos'] = [];
  fotosEliminar: number[] = [];
  nombreSaborNuevo = ''; errorFotos = ''; arrastrandoFotos = false;
  private llavePresentacion = 0;
  ngOnDestroy(): void { this.archivos.forEach(foto => URL.revokeObjectURL(foto.vistaPrevia)); }
  ngOnChanges(cambios: SimpleChanges): void {
    if (!cambios['producto']) return;
    this.nombre = this.producto?.nombre || ''; this.marca = this.producto?.marca || 'Pastelería Tony';
    this.categoria = this.producto?.categoria.id || 0; this.subcategoria = this.producto?.subcategoria?.id || null;
    this.sabor = this.producto?.sabor || ''; this.ingredientes = this.producto?.ingredientes || '';
    this.descripcion = this.producto?.descripcion || ''; this.destacado = this.producto?.destacado || false;
    this.presentaciones = (this.producto?.presentaciones || []).map(fila => ({ ...fila, llaveLocal: ++this.llavePresentacion }));
    if (!this.producto) this.presentaciones = [];
    this.archivos.forEach(foto => URL.revokeObjectURL(foto.vistaPrevia)); this.archivos = []; this.fotosEliminar = [];
  }
  categoriasPrincipales(): Categoria[] { return this.categorias.filter(categoria => !categoria.idPadre && categoria.activa); }
  subcategoriasCategoria(): Categoria[] { return this.categorias.filter(categoria => categoria.idPadre === Number(this.categoria) && categoria.activa); }
  cambiarCategoria(categoriaId: number): void {
    this.subcategoria = null; this.sabor = ''; this.categoriaCambio.emit({ categoriaId: Number(categoriaId) });
    if (!this.presentaciones.length && this.esCategoriaPasteles()) this.agregarPresentacion('kg');
  }
  cambiarSubcategoria(subcategoriaId: number | null): void { this.subcategoria = subcategoriaId; this.categoriaCambio.emit({ categoriaId: Number(this.categoria), subcategoriaId: subcategoriaId || undefined }); }
  seleccionarSabor(sabor: string): void { this.sabor = this.sabor === sabor ? '' : sabor; }
  agregarSabor(): void { const nombre = this.nombreSaborNuevo.trim(); if (nombre && this.categoria) { this.crearSabor.emit({ nombre, categoriaId: Number(this.categoria) }); this.sabor = nombre; this.nombreSaborNuevo = ''; } }
  agregarPresentacion(unidad?: UnidadPresentacion): void {
    const unidadInicial = unidad || (this.esCategoriaPasteles() ? 'kg' : 'pieza');
    this.presentaciones = [...this.presentaciones, { llaveLocal: ++this.llavePresentacion, cantidad: 1, unidad: unidadInicial, precio: 0, existencias: 0 }];
  }
  private esCategoriaPasteles(): boolean { return this.categorias.find(categoria => categoria.id === Number(this.categoria))?.nombre.toLocaleLowerCase().includes('pastel') || false; }
  cambiarExistencias(fila: FilaPresentacion, cambio: number): void { fila.existencias = Math.max(0, fila.existencias + cambio); }
  quitarPresentacion(llave: number): void { this.presentaciones = this.presentaciones.filter(fila => fila.llaveLocal !== llave); }
  seleccionarFotos(evento: Event): void { const input = evento.target as HTMLInputElement; this.agregarArchivos(Array.from(input.files || [])); input.value = ''; }
  soltarFotos(evento: DragEvent): void { evento.preventDefault(); this.arrastrandoFotos = false; this.agregarArchivos(Array.from(evento.dataTransfer?.files || [])); }
  private agregarArchivos(archivos: File[]): void {
    this.errorFotos = ''; const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
    for (const archivo of archivos) {
      if (!tiposPermitidos.includes(archivo.type)) { this.errorFotos = 'Usa imágenes JPG, PNG o WEBP.'; continue; }
      if (archivo.size > 10 * 1024 * 1024) { this.errorFotos = `${archivo.name} supera el máximo de 10 MB.`; continue; }
      if (this.fotosVisibles().length + this.archivos.length >= 6) { this.errorFotos = 'Puedes agregar hasta 6 fotos por producto.'; break; }
      this.archivos.push({ archivo, vistaPrevia: URL.createObjectURL(archivo) });
    }
  }
  quitarArchivo(indice: number): void { URL.revokeObjectURL(this.archivos[indice].vistaPrevia); this.archivos.splice(indice, 1); }
  quitarFotoExistente(foto: FotoProducto): void { if (foto.id && !this.fotosEliminar.includes(foto.id)) this.fotosEliminar = [...this.fotosEliminar, foto.id]; }
  fotosVisibles(): FotoProducto[] { return this.imagenesExistentes.filter(foto => !this.fotosEliminar.includes(foto.id)); }
  private presentacionesValidadas(): PresentacionPublicacion[] | null {
    const completas = this.presentaciones.filter(fila => fila.precio > 0 || fila.existencias > 0);
    if (completas.some(fila => !Number.isFinite(fila.cantidad) || fila.cantidad <= 0 || !Number.isFinite(fila.precio) || fila.precio <= 0 || !Number.isSafeInteger(fila.existencias) || fila.existencias < 0)) return null;
    const claves = new Set(completas.map(fila => `${fila.cantidad}|${fila.unidad}`));
    if (claves.size !== completas.length) return null;
    return completas.map(fila => ({ cantidad: fila.cantidad, unidad: fila.unidad, precio: fila.precio, existencias: fila.existencias }));
  }
  submit(): void {
    const presentaciones = this.presentacionesValidadas();
    if (!this.nombre.trim() || !this.categoria || !presentaciones) return;
    this.guardar.emit({
      publicacion: { nombre: this.nombre.trim(), marca: this.marca.trim(), categoriaId: Number(this.categoria), subcategoriaId: this.subcategoria, sabor: this.sabor.trim() || null, descripcion: this.descripcion.trim() || null, ingredientes: this.ingredientes.trim() || null, destacado: this.destacado, presentaciones },
      archivos: this.archivos,
      fotosEliminar: this.fotosEliminar,
    });
  }
}
