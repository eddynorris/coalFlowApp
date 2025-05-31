import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
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
  {
    path: '**', // Wildcard para rutas no encontradas
    redirectTo: 'dashboard'
  }
];