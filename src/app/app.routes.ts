import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    // Considera un componente Layout que envuelva las rutas hijas
    // Opcional: Redirigir a dashboard o a la primera sección
    redirectTo: 'dashboard', 
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => 
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard - CoalFlow' // Título dinámico para la pestaña del navegador
  },
  {
    path: 'cities',
    loadComponent: () =>
      import('./features/city-management/city-management.component').then(m => m.CityManagementComponent),
    title: 'Gestión de Ciudades - CoalFlow'
    // Podrías tener rutas hijas aquí para ver/editar una ciudad específica
    // children: [
    //   { path: ':id', component: CityDetailComponent }
    // ]
  },
  {
    path: 'inventory',
    loadComponent: () =>
      import('./features/inventory-view/inventory-view.component').then(m => m.InventoryViewComponent),
    title: 'Inventario - CoalFlow'
  },
  {
    path: 'transfer-orders',
    loadComponent: () =>
      import('./features/transfer-order/transfer-order.component').then(m => m.TransferOrderComponent),
    title: 'Órdenes de Traslado - CoalFlow'
  },
  // Ruta para depósitos si se gestionan por separado
  // {
  //   path: 'depots',
  //   loadComponent: () =>
  //     import('./features/depot-management/depot-management.component').then(m => m.DepotManagementComponent),
  //   title: 'Gestión de Depósitos - CoalFlow'
  // },
  {
    path: '**', // Wildcard para rutas no encontradas
    redirectTo: 'dashboard'
  }
];