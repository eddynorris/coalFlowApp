
export interface TransferOrder {
    id: string;
    fromDepotId: string;
    toDepotId: string;
    coalTypeId: string;
    quantity: number;
    orderDate: Date;
    status: 'pending' | 'completed' | 'cancelled';
  }