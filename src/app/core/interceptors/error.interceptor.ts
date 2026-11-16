import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/components/toast/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const router = inject(Router);
  return next(req).pipe(
    catchError((err: any) => {
      const mensaje = err?.error?.mensaje || err?.error?.message || 'Error de comunicación con el servidor';
      if (err.status === 401) {
        localStorage.removeItem('token');
        router.navigateByUrl('/login');
      } else if (err.status !== 0) {
        toast.error(mensaje);
      }
      return throwError(() => err);
    })
  );
};
