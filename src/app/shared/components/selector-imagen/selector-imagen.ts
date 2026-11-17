import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { LucideImagePlus, LucideTrash2, LucideUpload } from '@lucide/angular';

let siguienteIdSelector = 0;

@Component({
  selector: 'app-selector-imagen',
  standalone: true,
  imports: [LucideImagePlus, LucideTrash2, LucideUpload],
  templateUrl: './selector-imagen.html',
  styleUrl: './selector-imagen.css',
})
export class SelectorImagen implements OnChanges, OnDestroy {
  @Input() urlActual: string | null = null;
  @Input() nombre = 'imagen';
  @Input() deshabilitado = false;
  @Output() archivoCambio = new EventEmitter<File | null>();
  readonly idEntrada = `selector-imagen-${++siguienteIdSelector}`;
  archivo: File | null = null;
  vistaPrevia: string | null = null;
  error = '';

  ngOnChanges(cambios: SimpleChanges): void {
    if (cambios['urlActual'] && !this.archivo) this.vistaPrevia = this.urlActual;
  }

  ngOnDestroy(): void { this.liberarVistaPrevia(); }

  seleccionar(evento: Event): void {
    const entrada = evento.target as HTMLInputElement;
    const archivo = entrada.files?.[0] || null;
    entrada.value = '';
    if (!archivo) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type)) { this.error = 'Selecciona una imagen JPG, PNG o WEBP.'; return; }
    if (archivo.size > 10 * 1024 * 1024) { this.error = 'La imagen debe pesar máximo 10 MB.'; return; }
    this.error = '';
    this.liberarVistaPrevia();
    this.archivo = archivo;
    this.vistaPrevia = URL.createObjectURL(archivo);
    this.archivoCambio.emit(archivo);
  }

  quitar(): void {
    this.error = '';
    this.liberarVistaPrevia();
    this.archivo = null;
    this.vistaPrevia = null;
    this.archivoCambio.emit(null);
  }

  private liberarVistaPrevia(): void {
    if (this.archivo && this.vistaPrevia?.startsWith('blob:')) URL.revokeObjectURL(this.vistaPrevia);
  }
}
