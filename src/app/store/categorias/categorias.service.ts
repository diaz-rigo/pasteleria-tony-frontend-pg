import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/usuario.model';
import { Categoria } from '../../models/categoria.model';

@Injectable({ providedIn: 'root' })
export class CategoriasService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/categorias`;
  listar(): Observable<ApiResponse<Categoria[]>> { return this.http.get<ApiResponse<Categoria[]>>(this.base); }
  obtenerPorId(id: number): Observable<ApiResponse<Categoria>> { return this.http.get<ApiResponse<Categoria>>(`${this.base}/${id}`); }
  crear(data: Partial<Categoria>): Observable<ApiResponse<Categoria>> { return this.http.post<ApiResponse<Categoria>>(this.base, data); }
  actualizar(id: number, data: Partial<Categoria>): Observable<ApiResponse<Categoria>> { return this.http.put<ApiResponse<Categoria>>(`${this.base}/${id}`, data); }
  eliminar(id: number): Observable<ApiResponse<unknown>> { return this.http.delete<ApiResponse<unknown>>(`${this.base}/${id}`); }
}
