import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/usuario.model';
import { Portafolio } from '../../models/portafolio.model';
import { ColorPortafolio, EtiquetaPortafolio } from '../../models/entities.model';

@Injectable({ providedIn: 'root' })
export class PortafoliosService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/portafolios`;
  listar(): Observable<ApiResponse<Portafolio[]>> { return this.http.get<ApiResponse<Portafolio[]>>(this.base); }
  listarEtiquetas(): Observable<ApiResponse<EtiquetaPortafolio[]>> { return this.http.get<ApiResponse<EtiquetaPortafolio[]>>(`${environment.apiUrl}/etiquetas-portafolio`); }
  listarColores(): Observable<ApiResponse<ColorPortafolio[]>> { return this.http.get<ApiResponse<ColorPortafolio[]>>(`${environment.apiUrl}/colores-portafolio`); }
  obtenerPorId(id: number): Observable<ApiResponse<Portafolio>> { return this.http.get<ApiResponse<Portafolio>>(`${this.base}/${id}`); }
  crear(data: Partial<Portafolio>): Observable<ApiResponse<Portafolio>> { return this.http.post<ApiResponse<Portafolio>>(this.base, data); }
  actualizar(id: number, data: Partial<Portafolio>): Observable<ApiResponse<Portafolio>> { return this.http.put<ApiResponse<Portafolio>>(`${this.base}/${id}`, data); }
  eliminar(id: number): Observable<ApiResponse<unknown>> { return this.http.delete<ApiResponse<unknown>>(`${this.base}/${id}`); }
}
