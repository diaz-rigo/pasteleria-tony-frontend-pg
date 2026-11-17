import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { from, map } from 'rxjs';
import { AuthStore } from '../../store/auth/auth.store';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  return from(auth.restaurarSesion()).pipe(map(autenticado => {
    if (autenticado && auth.tienePermiso('ADMIN')) return true;
    return router.createUrlTree([autenticado ? '/' : '/login']);
  }));
};
