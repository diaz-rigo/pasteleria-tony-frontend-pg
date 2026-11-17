import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/usuario.model';
import { FotoProducto, Producto, PublicacionProducto, SaborPorCategoria } from '../../models/producto.model';

export interface FirmaCargaFoto { nombreNube: string; claveApi: string; marcaTemporal: number; carpeta: string; firma: string; }

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private readonly http = inject(HttpClient);
  private readonly productosUrl = `${environment.apiUrl}/productos`;
  private readonly saboresUrl = `${environment.apiUrl}/sabores`;
  listar(): Observable<ApiResponse<Producto[]>> { return this.http.get<ApiResponse<Producto[]>>(this.productosUrl); }
  listarSabores(categoriaId: number): Observable<ApiResponse<string[]>> { return this.http.get<ApiResponse<string[]>>(`${this.saboresUrl}?categoriaId=${categoriaId}`); }
  listarCatalogoSabores(): Observable<ApiResponse<SaborPorCategoria[]>> { return this.http.get<ApiResponse<SaborPorCategoria[]>>(`${this.saboresUrl}/catalogo`); }
  guardarSabor(nombre: string, categoriaId: number): Observable<ApiResponse<{ nombre: string }>> { return this.http.post<ApiResponse<{ nombre: string }>>(this.saboresUrl, { nombre, categoriaId }); }
  quitarSabor(nombre: string, categoriaId: number): Observable<ApiResponse<unknown>> { return this.http.delete<ApiResponse<unknown>>(`${this.saboresUrl}/categoria/${categoriaId}?nombre=${encodeURIComponent(nombre)}`); }
  guardarPublicacion(datos: PublicacionProducto, productoId?: number): Observable<ApiResponse<Producto>> {
    return productoId ? this.http.put<ApiResponse<Producto>>(`${this.productosUrl}/${productoId}/publicacion`, datos) : this.http.post<ApiResponse<Producto>>(`${this.productosUrl}/publicacion`, datos);
  }
  firmarCargaFoto(productoId: number): Observable<ApiResponse<FirmaCargaFoto>> { return this.http.post<ApiResponse<FirmaCargaFoto>>(`${environment.apiUrl}/cloudinary/upload-signature`, { productoId }); }
  guardarFotos(productoId: number, fotos: Array<Pick<FotoProducto, 'url'>>, eliminarIds: number[]): Observable<ApiResponse<Producto>> {
    return this.http.post<ApiResponse<Producto>>(`${this.productosUrl}/${productoId}/fotos`, { fotos, eliminarIds });
  }
  obtenerPorId(productoId: number): Observable<ApiResponse<Producto>> { return this.http.get<ApiResponse<Producto>>(`${this.productosUrl}/${productoId}`); }
  eliminar(productoId: number): Observable<ApiResponse<unknown>> { return this.http.delete<ApiResponse<unknown>>(`${this.productosUrl}/${productoId}`); }
}
