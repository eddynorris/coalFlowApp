import { Component, computed, inject, Signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common'; // DecimalPipe para formatear números

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import { InventoryService } from '../../services/inventory.service';
import { DepotService } from '../../services/depot.service';
import { CityService } from '../../services/city.service'; // Para contar ciudades
import { TransferOrderService } from '../../services/transfer-order.service'; // Para contar órdenes

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private inventoryService = inject(InventoryService);
  private depotService = inject(DepotService);
  private cityService = inject(CityService);
  private transferOrderService = inject(TransferOrderService);

  // Total de toneladas de carbón disponibles en todos los depósitos
  totalStock: Signal<number> = computed(() =>
    this.inventoryService.inventoryItems().reduce((sum, item) => sum + item.quantity, 0)
  );

  // Número de depósitos activos (simplemente contamos todos los depósitos existentes)
  activeDepotsCount: Signal<number> = computed(() => this.depotService.depots().length);

  // Número de ciudades registradas
  citiesCount: Signal<number> = computed(() => this.cityService.cities().length);
  
  // Número total de órdenes de traslado
  transferOrdersCount: Signal<number> = computed(() => this.transferOrderService.transferOrders().length);

}