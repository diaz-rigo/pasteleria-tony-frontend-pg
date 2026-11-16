import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../../store/auth/auth.store';

export function permissionGuard(permiso: string): CanActivateFn {
  return () => {
    const auth = inject(AuthStore);
    const router = inject(Router);
    if (auth.tienePermiso(permiso)) return true;
    return router.createUrlTree(['/']);
  };
}
