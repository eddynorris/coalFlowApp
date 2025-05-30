
export interface InventoryItem {
    id: string;
    depotId: string;
    coalTypeId: string;
    quantity: number; // En toneladas
    lastUpdated: Date;
  }