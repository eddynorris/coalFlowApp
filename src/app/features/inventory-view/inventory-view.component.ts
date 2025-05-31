import { Component, computed, inject, Signal, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para pipes y directivas comunes

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Para feedback de carga
import { MatTooltipModule } from '@angular/material/tooltip';

import { InventoryService } from '../../services/inventory.service';
import { DepotService } from '../../services/depot.service';
import { CityService } from '../../services/city.service';
import { CoalTypeService } from '../../services/coal-type.service';
import { MatIcon } from '@angular/material/icon';

// Interface para el objeto combinado que se mostrará en la tabla
export interface DisplayInventoryItem {
  id: string; // ID del InventoryItem original para trackBy
  cityName: string;
  depotName: string;
  coalTypeName: string;
  quantity: number;
  lastUpdated: Date;
  cityId?: string; // Opcional, para filtros futuros
  depotId?: string; // Opcional, para filtros futuros
}

@Component({
  selector: 'app-inventory-view',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatIcon,
  ],
  templateUrl: './inventory-view.component.html',
  styleUrls: ['./inventory-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryViewComponent {
  private inventoryService = inject(InventoryService);
  private depotService = inject(DepotService);
  private cityService = inject(CityService);
  private coalTypeService = inject(CoalTypeService);

  isLoading = signal(false); // Signal para estado de carga

  inventoryDisplayItems: Signal<DisplayInventoryItem[]> = computed(() => {
    const inventoryItems = this.inventoryService.inventoryItems();
    const depots = this.depotService.depots();
    const cities = this.cityService.cities();
    const coalTypes = this.coalTypeService.coalTypes();
    const mappedItems = inventoryItems.map(item => {
      const depot = depots.find(d => d.id === item.depotId);
      const city = depot ? cities.find(c => c.id === depot.cityId) : undefined;
      const coalType = coalTypes.find(ct => ct.id === item.coalTypeId);

      return {
        id: item.id,
        cityName: city?.name || 'Ciudad Desconocida',
        depotName: depot?.name || 'Depósito Desconocido',
        coalTypeName: coalType?.name || 'Tipo Desconocido',
        quantity: item.quantity,
        lastUpdated: item.lastUpdated,
        cityId: city?.id,
        depotId: depot?.id,
      };
    });
    return mappedItems;
  });

  displayedColumns: string[] = ['cityName', 'depotName', 'coalTypeName', 'quantity', 'lastUpdated'];

  trackById(index: number, item: DisplayInventoryItem): string {
    return item.id;
  }
}