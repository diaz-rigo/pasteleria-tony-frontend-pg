import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/usuario.model';

interface LoginPayload { strUsuEmail: string; strUsuPassword: string; }
interface LoginData { token: string; usuario: { intUsuLlave: number; strUsuEmail: string; strUsuRol: string; }; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/auth`;

  login(payload: LoginPayload): Observable<ApiResponse<LoginData>> {
    return this.http.post<ApiResponse<LoginData>>(`${this.base}/login`, payload);
  }
}
