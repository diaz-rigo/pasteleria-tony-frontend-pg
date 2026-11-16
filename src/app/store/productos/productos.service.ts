import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/usuario.model';
import { Producto } from '../../models/producto.model';
import { Calificacion, ImagenVariante, Talla, VarianteProducto } from '../../models/entities.model';

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/productos`;
  listar(): Observable<ApiResponse<Producto[]>> { return this.http.get<ApiResponse<Producto[]>>(this.base); }
  listarVariantes(): Observable<ApiResponse<VarianteProducto[]>> { return this.http.get<ApiResponse<VarianteProducto[]>>(`${environment.apiUrl}/variantes-producto`); }
  listarImagenesVariantes(): Observable<ApiResponse<ImagenVariante[]>> { return this.http.get<ApiResponse<ImagenVariante[]>>(`${environment.apiUrl}/imagenes-variante`); }
  listarTallas(): Observable<ApiResponse<Talla[]>> { return this.http.get<ApiResponse<Talla[]>>(`${environment.apiUrl}/tallas`); }
  listarCalificaciones(): Observable<ApiResponse<Calificacion[]>> { return this.http.get<ApiResponse<Calificacion[]>>(`${environment.apiUrl}/calificaciones`); }
  obtenerPorId(id: number): Observable<ApiResponse<Producto>> { return this.http.get<ApiResponse<Producto>>(`${this.base}/${id}`); }
  crear(data: Partial<Producto>): Observable<ApiResponse<Producto>> { return this.http.post<ApiResponse<Producto>>(this.base, data); }
  actualizar(id: number, data: Partial<Producto>): Observable<ApiResponse<Producto>> { return this.http.put<ApiResponse<Producto>>(`${this.base}/${id}`, data); }
  eliminar(id: number): Observable<ApiResponse<unknown>> { return this.http.delete<ApiResponse<unknown>>(`${this.base}/${id}`); }
}
