import { Injectable, signal, WritableSignal } from '@angular/core';
import { Depot } from '../models/depot.model'; // Asegúrate que la ruta al modelo sea correcta
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class DepotService {
  // Datos iniciales simulados (puedes agregar más o conectarlos con City IDs existentes)
  private depotsSignal: WritableSignal<Depot[]> = signal([
    { id: 'depot1', name: 'Depósito Tamburco', cityId: 'city1' }, // Reemplaza con ID real de una ciudad
    { id: 'depot2', name: 'Depósito Americas', cityId: 'city1' },
    { id: 'depot3', name: 'Depósito Av.Peru', cityId: 'city2' }  // Reemplaza con ID real de otra ciudad
  ]);

  public depots = this.depotsSignal.asReadonly();

  constructor() { }

  addDepot(name: string, cityId: string): Depot {
    const newDepot: Depot = { id: uuidv4(), name, cityId };
    this.depotsSignal.update(depots => [...depots, newDepot]);
    return newDepot;
  }

  updateDepot(updatedDepot: Depot): void {
    this.depotsSignal.update(depots =>
      depots.map(depot => (depot.id === updatedDepot.id ? updatedDepot : depot))
    );
  }

  deleteDepot(id: string): void {
    this.depotsSignal.update(depots => depots.filter(depot => depot.id !== id));
  }

  getDepotById(id: string): Depot | undefined {
    return this.depots().find(depot => depot.id === id);
  }

  getDepotsByCityId(cityId: string): Depot[] {
    return this.depots().filter(depot => depot.cityId === cityId);
  }
}