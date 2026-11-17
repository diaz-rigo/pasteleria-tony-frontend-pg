import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-layout/admin-layout').then(m => m.AdminLayout),
    children: [
      { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
      { path: 'usuarios', loadComponent: () => import('./usuarios/usuarios/usuarios').then(m => m.Usuarios) },
      { path: 'categorias', loadComponent: () => import('./categorias/categorias/categorias').then(m => m.Categorias) },
      { path: 'sabores', loadComponent: () => import('./sabores/sabores').then(m => m.SaboresAdmin) },
      { path: 'productos', loadComponent: () => import('./productos/productos/productos').then(m => m.Productos) },
      { path: 'pedidos', loadComponent: () => import('./pedidos/pedidos/pedidos').then(m => m.Pedidos) },
      { path: 'galerias', loadComponent: () => import('./galerias/galerias/galerias').then(m => m.Galerias) },
      { path: 'portafolios', loadComponent: () => import('./portafolios/portafolios/portafolios').then(m => m.Portafolios) },
      { path: 'configuracion', loadComponent: () => import('./configuracion/configuracion/configuracion').then(m => m.ConfiguracionAdmin) },
    ],
  },
];
