import { Injectable, signal, WritableSignal } from '@angular/core';
import { CoalType } from '../models/coal-type.model'; // Asegúrate que la ruta al modelo sea correcta
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class CoalTypeService {
  private coalTypesSignal: WritableSignal<CoalType[]> = signal([
    { id: 'type1', name: 'Comercial' },
    { id: 'type2', name: 'Tercera' },
    { id: 'type3', name: 'Menudo' },
  ]);

  public coalTypes = this.coalTypesSignal.asReadonly();

  constructor() { }

  getCoalTypeById(id: string): CoalType | undefined {
    return this.coalTypes().find(type => type.id === id);
  }
}