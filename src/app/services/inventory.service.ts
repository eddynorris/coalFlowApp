import { Injectable, signal, WritableSignal, computed } from '@angular/core';
import { InventoryItem } from '../models/inventory.model'; // Asegúrate que la ruta al modelo sea correcta
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  // Datos iniciales simulados (asocia con IDs de Depósitos y Tipos de Carbón existentes)
  private inventoryItemsSignal: WritableSignal<InventoryItem[]> = signal([
    { id: 'inv1', depotId: 'depot1', coalTypeId: 'type1', quantity: 100, lastUpdated: new Date() },
    { id: 'inv2', depotId: 'depot1', coalTypeId: 'type2', quantity: 50, lastUpdated: new Date() },
    { id: 'inv3', depotId: 'depot1', coalTypeId: 'type3', quantity: 75, lastUpdated: new Date() },
    { id: 'inv4', depotId: 'depot2', coalTypeId: 'type2', quantity: 80, lastUpdated: new Date() },
    { id: 'inv5', depotId: 'depot2', coalTypeId: 'type1', quantity: 50, lastUpdated: new Date() },
    { id: 'inv6', depotId: 'depot3', coalTypeId: 'type1', quantity: 75, lastUpdated: new Date() },
  ]);

  public inventoryItems = this.inventoryItemsSignal.asReadonly();

  constructor() { }

  /**
   * Obtiene el stock de un tipo específico de carbón en un depósito específico.
   * @param depotId El ID del depósito.
   * @param coalTypeId El ID del tipo de carbón.
   * @returns La cantidad de stock o 0 si no se encuentra.
   */
  getStock(depotId: string, coalTypeId: string): number {
    const item = this.inventoryItems().find(
      i => i.depotId === depotId && i.coalTypeId === coalTypeId
    );
    return item ? item.quantity : 0;
  }

  /**
   * Actualiza el stock de un item de inventario específico.
   * Si el item no existe, lo crea.
   * Si la cantidad resultante es 0 o menos, considera eliminar el item o manejarlo según la lógica de negocio.
   * @param depotId El ID del depósito.
   * @param coalTypeId El ID del tipo de carbón.
   * @param quantityChange La cantidad a sumar (si es positiva) o restar (si es negativa).
   * @returns boolean indicando si la operación fue exitosa.
   */
  updateStock(depotId: string, coalTypeId: string, quantityChange: number): boolean {
    this.inventoryItemsSignal.update(items => {
      const itemIndex = items.findIndex(
        i => i.depotId === depotId && i.coalTypeId === coalTypeId
      );

      if (itemIndex > -1) {
        // Item existente, actualizar cantidad
        const newQuantity = items[itemIndex].quantity + quantityChange;
        if (newQuantity < 0) {
          // No se permite stock negativo en este modelo simple
          console.warn(`Intento de dejar stock negativo para ${coalTypeId} en ${depotId}. Operación cancelada para este item.`);
          items[itemIndex] = { ...items[itemIndex], quantity: newQuantity, lastUpdated: new Date() };
        } else {
           items[itemIndex] = { ...items[itemIndex], quantity: newQuantity, lastUpdated: new Date() };
        }

      } else if (quantityChange > 0) {
        // Item no existente, crear nuevo si la cantidad es positiva
        items.push({
          id: uuidv4(),
          depotId,
          coalTypeId,
          quantity: quantityChange,
          lastUpdated: new Date()
        });
      } else {
        // Intentando reducir stock de un item no existente o añadir cantidad 0 o negativa
        console.warn(`Intento de actualizar stock no existente (${coalTypeId} en ${depotId}) con cantidad no positiva.`);
        return items; // No se modifica
      }
      return [...items]; // Retornar una nueva instancia del array para que Signal detecte el cambio
    });
    return true;
  }


  addInventoryItem(item: Omit<InventoryItem, 'id' | 'lastUpdated'>): InventoryItem {
    const newInventoryItem: InventoryItem = {
      ...item,
      id: uuidv4(),
      lastUpdated: new Date()
    };
    this.inventoryItemsSignal.update(items => [...items, newInventoryItem]);
    return newInventoryItem;
  }

  /**
   * (Opcional) Obtiene todos los items de inventario para un depósito específico.
   */
  getInventoryByDepot(depotId: string): InventoryItem[] {
    return this.inventoryItems().filter(item => item.depotId === depotId);
  }
}