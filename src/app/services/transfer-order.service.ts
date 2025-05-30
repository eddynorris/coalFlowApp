import { Injectable, signal, WritableSignal } from '@angular/core';
import { TransferOrder } from '../models/transfer-order.model'; // Asegúrate que la ruta al modelo sea correcta
import { InventoryService } from './inventory.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class TransferOrderService {
  private transferOrdersSignal: WritableSignal<TransferOrder[]> = signal([]);
  public transferOrders = this.transferOrdersSignal.asReadonly();

  constructor(private inventoryService: InventoryService) { }

  /**
   * Crea una nueva orden de traslado y actualiza el inventario.
   * Asume que la validación de stock suficiente ya se ha realizado.
   * @param orderData Datos parciales de la orden (sin id, orderDate, status).
   * @returns La orden de traslado creada o null si falla la actualización de stock.
   */
  createTransferOrder(orderData: Omit<TransferOrder, 'id' | 'orderDate' | 'status'>): TransferOrder | null {
    const newOrder: TransferOrder = {
      ...orderData,
      id: uuidv4(),
      orderDate: new Date(),
      status: 'pending' // Inicialmente pendiente
    };

    // Actualizar stock en depósito origen (restar)
    const stockUpdatedOrigin = this.inventoryService.updateStock(
      newOrder.fromDepotId,
      newOrder.coalTypeId,
      -newOrder.quantity // Cantidad negativa para restar
    );

    if (!stockUpdatedOrigin) {
      console.error('Error al actualizar stock en el depósito origen.');
      // Aquí podrías tener lógica para revertir si fuera una transacción real.
      return null;
    }

    // Actualizar stock en depósito destino (sumar)
    const stockUpdatedDestination = this.inventoryService.updateStock(
      newOrder.toDepotId,
      newOrder.coalTypeId,
      newOrder.quantity // Cantidad positiva para sumar
    );

    if (!stockUpdatedDestination) {
      console.error('Error al actualizar stock en el depósito destino. Intentando revertir origen...');
      // Revertir la resta del origen si falla el destino
      this.inventoryService.updateStock(
        newOrder.fromDepotId,
        newOrder.coalTypeId,
        newOrder.quantity // Sumar de nuevo para revertir
      );
      return null;
    }

    // Si ambas actualizaciones de stock son exitosas, se completa la orden.
    newOrder.status = 'completed'; // Marcar como completada para este ejemplo simple
    this.transferOrdersSignal.update(orders => [...orders, newOrder]);
    return newOrder;
  }

  getTransferOrderById(id: string): TransferOrder | undefined {
    return this.transferOrders().find(order => order.id === id);
  }
}