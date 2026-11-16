import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/inicio/inicio/inicio').then(m => m.Inicio),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/inicio/auth/login/login').then(m => m.Login),
  },
  {
    path: 'catalogo',
    loadComponent: () => import('./features/public/catalogo/catalogo/catalogo').then(m => m.Catalogo),
  },
  {
    path: 'producto/:id',
    loadComponent: () => import('./features/public/producto-detalle/producto-detalle').then(m => m.ProductoDetalle),
  },
  { path: 'productos', redirectTo: 'catalogo', pathMatch: 'full' },
  {
    path: 'galeria',
    loadComponent: () => import('./features/public/galeria/galeria/galeria').then(m => m.Galeria),
  },
  {
    path: 'portafolio',
    loadComponent: () => import('./features/public/portafolio/portafolio/portafolio').then(m => m.Portafolio),
  },
  {
    path: 'admin',
    canActivate: [() => import('./core/guards/auth.guard').then(m => m.authGuard)],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
