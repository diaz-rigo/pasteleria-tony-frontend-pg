import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/usuario.model';
import { Pedido } from '../../models/pedido.model';

@Injectable({ providedIn: 'root' })
export class PedidosService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/pedidos`;
  listar(): Observable<ApiResponse<Pedido[]>> { return this.http.get<ApiResponse<Pedido[]>>(this.base); }
  obtenerPorId(id: number): Observable<ApiResponse<Pedido>> { return this.http.get<ApiResponse<Pedido>>(`${this.base}/${id}`); }
  crear(data: Partial<Pedido>): Observable<ApiResponse<Pedido>> { return this.http.post<ApiResponse<Pedido>>(this.base, data); }
  actualizar(id: number, data: Partial<Pedido>): Observable<ApiResponse<Pedido>> { return this.http.put<ApiResponse<Pedido>>(`${this.base}/${id}`, data); }
  eliminar(id: number): Observable<ApiResponse<unknown>> { return this.http.delete<ApiResponse<unknown>>(`${this.base}/${id}`); }
}
