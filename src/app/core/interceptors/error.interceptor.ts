import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/components/toast/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  return next(req).pipe(
    catchError((err: any) => {
      const mensaje = err?.error?.mensaje || err?.error?.message || 'Error de comunicación con el servidor';
      if (err.status === 401) {
        if (!req.url.endsWith('/auth/login') && !req.url.endsWith('/auth/session') && typeof window !== 'undefined') {
          window.dispatchEvent(new Event('pasteleria:auth-expired'));
        }
      } else if (err.status !== 0 && !req.url.endsWith('/auth/login')) {
        toast.error(mensaje);
      }
      return throwError(() => err);
    })
  );
};
