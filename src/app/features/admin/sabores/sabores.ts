import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { CategoriasStore } from '../../../store/categorias/categorias.store';
import { ProductosStore } from '../../../store/productos/productos.store';
import { ProductosService } from '../../../store/productos/productos.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { LucidePlus, LucideTags, LucideTrash2 } from '@lucide/angular';

@Component({ selector: 'app-sabores-admin', imports: [FormsModule, LucidePlus, LucideTags, LucideTrash2], templateUrl: './sabores.html', styleUrl: './sabores.css' })
export class SaboresAdmin implements OnInit {
  readonly categorias = inject(CategoriasStore);
  readonly productos = inject(ProductosStore);
  private readonly service = inject(ProductosService);
  private readonly toast = inject(ToastService);
  categoriaId = 0;
  nombre = '';
  guardando = false;
  ngOnInit(): void { this.categorias.cargar(); this.productos.cargar(); }
  seleccionarCategoria(id: number): void { this.categoriaId = Number(id); }
  get saboresActuales(): string[] { return this.categoriaId ? this.productos.saboresCategoria(this.categoriaId) : []; }
  categoriaNombre(): string { return this.categorias.categorias().find(c => c.id === this.categoriaId)?.nombre || ''; }
  categoriaPadre(id?: number): string | null { const item = this.categorias.categorias().find(c => c.id === id); return item?.idPadre ? this.categorias.categorias().find(c => c.id === item.idPadre)?.nombre || null : null; }
  async agregar(): Promise<void> {
    const nombre = this.nombre.trim(); if (!nombre || !this.categoriaId || this.guardando) return;
    this.guardando = true;
    try { await this.productos.guardarSabor(nombre, this.categoriaId); this.nombre = ''; this.toast.success(`Sabor disponible en ${this.categoriaNombre()}.`); }
    catch (error) { this.toast.error(error instanceof Error ? error.message : 'No se pudo asignar el sabor.'); }
    finally { this.guardando = false; }
  }
  async quitar(nombre: string): Promise<void> {
    try { const result = await firstValueFrom(this.service.quitarSabor(nombre, this.categoriaId)); if (!result.ok) throw new Error(result.mensaje); this.productos.saboresPorCategoria.update(items => items.map(item => item.categoriaId === this.categoriaId ? { ...item, sabores: item.sabores.filter(sabor => sabor !== nombre) } : item)); this.toast.success('Sabor quitado de esta categoría.'); }
    catch (error) { this.toast.error(error instanceof Error ? error.message : 'No se pudo quitar el sabor.'); }
  }
}
