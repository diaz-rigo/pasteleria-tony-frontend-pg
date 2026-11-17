import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { from, map } from 'rxjs';
import { AuthStore } from '../../store/auth/auth.store';

export function permissionGuard(permiso: string): CanActivateFn {
  return () => {
    const auth = inject(AuthStore);
    const router = inject(Router);
    return from(auth.restaurarSesion()).pipe(map(autenticado =>
      autenticado && auth.tienePermiso(permiso) ? true : router.createUrlTree([autenticado ? '/' : '/login']),
    ));
  };
}
