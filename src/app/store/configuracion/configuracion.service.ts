import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/usuario.model';
import { Configuracion } from '../../models/configuracion.model';
import { EmailConfiguracion, EnlacePie, HorarioConfiguracion, RedSocialConfiguracion, TelefonoConfiguracion } from '../../models/entities.model';

@Injectable({ providedIn: 'root' })
export class ConfiguracionService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/configuracion`;
  listar(): Observable<ApiResponse<Configuracion[]>> { return this.http.get<ApiResponse<Configuracion[]>>(this.base); }
  listarTelefonos(): Observable<ApiResponse<TelefonoConfiguracion[]>> { return this.http.get<ApiResponse<TelefonoConfiguracion[]>>(`${environment.apiUrl}/telefonos-configuracion`); }
  crearTelefono(data: Partial<TelefonoConfiguracion>): Observable<ApiResponse<TelefonoConfiguracion>> { return this.http.post<ApiResponse<TelefonoConfiguracion>>(`${environment.apiUrl}/telefonos-configuracion`, data); }
  actualizarTelefono(id: number, data: Partial<TelefonoConfiguracion>): Observable<ApiResponse<TelefonoConfiguracion>> { return this.http.put<ApiResponse<TelefonoConfiguracion>>(`${environment.apiUrl}/telefonos-configuracion/${id}`, data); }
  listarEmails(): Observable<ApiResponse<EmailConfiguracion[]>> { return this.http.get<ApiResponse<EmailConfiguracion[]>>(`${environment.apiUrl}/emails-configuracion`); }
  listarHorarios(): Observable<ApiResponse<HorarioConfiguracion[]>> { return this.http.get<ApiResponse<HorarioConfiguracion[]>>(`${environment.apiUrl}/horarios-configuracion`); }
  listarRedes(): Observable<ApiResponse<RedSocialConfiguracion[]>> { return this.http.get<ApiResponse<RedSocialConfiguracion[]>>(`${environment.apiUrl}/redes-sociales-configuracion`); }
  listarEnlaces(): Observable<ApiResponse<EnlacePie[]>> { return this.http.get<ApiResponse<EnlacePie[]>>(`${environment.apiUrl}/enlaces-pie`); }
  obtenerPorId(id: number): Observable<ApiResponse<Configuracion>> { return this.http.get<ApiResponse<Configuracion>>(`${this.base}/${id}`); }
  crear(data: Partial<Configuracion>): Observable<ApiResponse<Configuracion>> { return this.http.post<ApiResponse<Configuracion>>(this.base, data); }
  actualizar(id: number, data: Partial<Configuracion>): Observable<ApiResponse<Configuracion>> { return this.http.put<ApiResponse<Configuracion>>(`${this.base}/${id}`, data); }
  eliminar(id: number): Observable<ApiResponse<unknown>> { return this.http.delete<ApiResponse<unknown>>(`${this.base}/${id}`); }
}
