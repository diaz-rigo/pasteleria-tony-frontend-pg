import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../../store/auth/auth.store';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!esSolicitudDeLaApi(req.url)) return next(req);
  const auth = inject(AuthStore);
  const token = auth.token();
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};

function esSolicitudDeLaApi(url: string): boolean {
  try { return new URL(url, globalThis.location.origin).origin === new URL(environment.apiUrl).origin; }
  catch { return false; }
}
