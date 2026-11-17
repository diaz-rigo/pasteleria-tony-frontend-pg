import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const withCredentialsInterceptor: HttpInterceptorFn = (req, next) => {
  // Las cookies solo se envían a nuestra API; Cloudinary y otros proveedores
  // externos deben recibir una petición sin credenciales del navegador.
  if (!esSolicitudDeLaApi(req.url)) return next(req);
  return next(req.clone({ withCredentials: true }));
};

function esSolicitudDeLaApi(url: string): boolean {
  try { return new URL(url, globalThis.location.origin).origin === new URL(environment.apiUrl).origin; }
  catch { return false; }
}
