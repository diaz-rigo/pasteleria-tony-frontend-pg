import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/usuario.model';
import { Galeria } from '../../models/galeria.model';
import { CategoriaGaleria, EtiquetaGaleria, ImagenGaleria } from '../../models/entities.model';

@Injectable({ providedIn: 'root' })
export class GaleriasService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/galerias`;
  listar(): Observable<ApiResponse<Galeria[]>> { return this.http.get<ApiResponse<Galeria[]>>(this.base); }
  listarImagenes(): Observable<ApiResponse<ImagenGaleria[]>> { return this.http.get<ApiResponse<ImagenGaleria[]>>(`${environment.apiUrl}/imagenes-galeria`); }
  crearImagen(data: Partial<ImagenGaleria>): Observable<ApiResponse<ImagenGaleria>> { return this.http.post<ApiResponse<ImagenGaleria>>(`${environment.apiUrl}/imagenes-galeria`, data); }
  actualizarImagen(id:number, data:Partial<ImagenGaleria>): Observable<ApiResponse<ImagenGaleria>> { return this.http.put<ApiResponse<ImagenGaleria>>(`${environment.apiUrl}/imagenes-galeria/${id}`,data); }
  listarCategorias(): Observable<ApiResponse<CategoriaGaleria[]>> { return this.http.get<ApiResponse<CategoriaGaleria[]>>(`${environment.apiUrl}/categorias-galeria`); }
  listarEtiquetas(): Observable<ApiResponse<EtiquetaGaleria[]>> { return this.http.get<ApiResponse<EtiquetaGaleria[]>>(`${environment.apiUrl}/etiquetas-galeria`); }
  obtenerPorId(id: number): Observable<ApiResponse<Galeria>> { return this.http.get<ApiResponse<Galeria>>(`${this.base}/${id}`); }
  crear(data: Partial<Galeria>): Observable<ApiResponse<Galeria>> { return this.http.post<ApiResponse<Galeria>>(this.base, data); }
  actualizar(id: number, data: Partial<Galeria>): Observable<ApiResponse<Galeria>> { return this.http.put<ApiResponse<Galeria>>(`${this.base}/${id}`, data); }
  eliminar(id: number): Observable<ApiResponse<unknown>> { return this.http.delete<ApiResponse<unknown>>(`${this.base}/${id}`); }
}
