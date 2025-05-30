import { Injectable, signal, WritableSignal } from '@angular/core';
import { City } from '../models/city.model';
import { v4 as uuidv4 } from 'uuid'; // npm install uuid && npm install --save-dev @types/uuid

@Injectable({ providedIn: 'root' })
export class CityService {
  private citiesSignal: WritableSignal<City[]> = signal([
    { id: 'city1', name: 'Abancay' },
    { id: 'city2', name: 'Andahuaylas' },
  ]);

  public cities = this.citiesSignal.asReadonly();

  addCity(name: string): void {
    const newCity: City = { id: uuidv4(), name };
    this.citiesSignal.update(cities => [...cities, newCity]);
  }

  updateCity(updatedCity: City): void {
    this.citiesSignal.update(cities =>
      cities.map(city => (city.id === updatedCity.id ? updatedCity : city))
    );
  }

  deleteCity(id: string): void {
    this.citiesSignal.update(cities => cities.filter(city => city.id !== id));
  }

  getCityById(id: string): City | undefined {
    return this.cities().find(city => city.id === id);
  }
}
      