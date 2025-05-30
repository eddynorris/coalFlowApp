import { Component, computed, inject, signal, WritableSignal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { City } from '../../models/city.model';
import { CityService } from '../../services/city.service';
import { Depot } from '../../models/depot.model';
import { DepotService } from '../../services/depot.service';

@Component({
  selector: 'app-city-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatDividerModule,
    MatSnackBarModule,
  ],
  templateUrl: './city-management.component.html',
  styleUrls: ['./city-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CityManagementComponent {
  public cityService = inject(CityService);
  public depotService = inject(DepotService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  showCityForm = signal(false);
  editingCityId: WritableSignal<string | null> = signal(null);
  cityForm: FormGroup;

  showDepotForm = signal(false);
  editingDepotId: WritableSignal<string | null> = signal(null);
  depotForm: FormGroup;

  selectedCity: WritableSignal<City | null> = signal(null);
  
  depotsForSelectedCity = computed(() => {
    const currentCity: City | null = this.selectedCity();
    if (!currentCity) {
      return [];
    }
    // A este punto, currentCity es de tipo City
    return this.depotService.depots().filter((d: Depot) => d.cityId === currentCity.id);
  });

  cityDisplayedColumns: string[] = ['name', 'actions'];
  depotDisplayedColumns: string[] = ['name', 'actions'];

  constructor() {
    this.cityForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    });
    this.depotForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    });
  }

  openCityForm(cityToEdit?: City): void {
    this.showDepotForm.set(false); 
    this.showCityForm.set(true);
    if (cityToEdit) {
      this.editingCityId.set(cityToEdit.id);
      this.cityForm.patchValue({ name: cityToEdit.name });
    } else {
      this.editingCityId.set(null);
      this.cityForm.reset();
    }
  }

  saveCity(): void {
    if (this.cityForm.invalid) {
      this.snackBar.open('Por favor, corrige los errores en el formulario de ciudad.', 'Cerrar', { duration: 3000 });
      return;
    }
    const cityName = this.cityForm.value.name;
    const currentEditingCityId = this.editingCityId();

    if (currentEditingCityId) {
      this.cityService.updateCity({ id: currentEditingCityId, name: cityName });
      this.snackBar.open(`Ciudad "${cityName}" actualizada correctamente.`, 'Cerrar', { duration: 3000 });
    } else {
      this.cityService.addCity(cityName);
      this.snackBar.open(`Ciudad "${cityName}" creada correctamente.`, 'Cerrar', { duration: 3000 });
    }
    this.closeCityForm();
  }

  closeCityForm(): void {
    this.showCityForm.set(false);
    this.editingCityId.set(null);
    this.cityForm.reset();
  }

  editCity(cityToEdit: City): void {
    this.selectCity(null); 
    this.openCityForm(cityToEdit);
  }

  confirmDeleteCity(cityToDelete: City): void {
    if (confirm(`¿Estás seguro de eliminar la ciudad "${cityToDelete.name}"? Esto también eliminará todos sus depósitos asociados.`)) {
      const depotsInCity = this.depotService.getDepotsByCityId(cityToDelete.id);
      depotsInCity.forEach(depot => this.depotService.deleteDepot(depot.id));
      
      this.cityService.deleteCity(cityToDelete.id);
      this.snackBar.open(`Ciudad "${cityToDelete.name}" y sus depósitos eliminados.`, 'Cerrar', { duration: 3000 });

      const currentSelectedCity = this.selectedCity();
      if (currentSelectedCity && currentSelectedCity.id === cityToDelete.id) {
        this.selectCity(null); 
      }
    }
  }

  selectCity(cityToSelect: City | null): void {
    this.selectedCity.set(cityToSelect); // cityToSelect es City | null, lo cual es correcto para WritableSignal
    this.closeCityForm(); 
    this.closeDepotForm(); 
  }

  openDepotForm(depotToEdit?: Depot): void {
    const currentSelectedCity = this.selectedCity();
    if (!currentSelectedCity) {
      this.snackBar.open('Por favor, selecciona una ciudad primero.', 'Cerrar', { duration: 3000 });
      return;
    }
    this.showDepotForm.set(true);
    if (depotToEdit) {
      this.editingDepotId.set(depotToEdit.id); // depotToEdit.id es string, correcto para WritableSignal
      this.depotForm.patchValue({ name: depotToEdit.name });
    } else {
      this.editingDepotId.set(null);
      this.depotForm.reset();
    }
  }

  saveDepot(): void {
    const currentSelectedCity = this.selectedCity();
    if (this.depotForm.invalid || !currentSelectedCity) {
      this.snackBar.open('Por favor, corrige los errores o selecciona una ciudad.', 'Cerrar', { duration: 3000 });
      return;
    }
    // A este punto, currentSelectedCity es de tipo City
    const depotName = this.depotForm.value.name;
    const cityId = currentSelectedCity.id; 
    const currentEditingDepotId = this.editingDepotId();

    if (currentEditingDepotId) {
      this.depotService.updateDepot({ id: currentEditingDepotId, name: depotName, cityId });
      this.snackBar.open(`Depósito "${depotName}" actualizado.`, 'Cerrar', { duration: 3000 });
    } else {
      this.depotService.addDepot(depotName, cityId);
      this.snackBar.open(`Depósito "${depotName}" agregado a ${currentSelectedCity.name}.`, 'Cerrar', { duration: 3000 });
    }
    this.closeDepotForm();
  }

  closeDepotForm(): void {
    this.showDepotForm.set(false);
    this.editingDepotId.set(null);
    this.depotForm.reset();
  }

  editDepot(depotToEdit: Depot): void {
    this.openDepotForm(depotToEdit);
  }

  confirmDeleteDepot(depotToDelete: Depot): void {
    if (confirm(`¿Estás seguro de eliminar el depósito "${depotToDelete.name}"?`)) {
      this.depotService.deleteDepot(depotToDelete.id);
      this.snackBar.open(`Depósito "${depotToDelete.name}" eliminado.`, 'Cerrar', { duration: 3000 });
    }
  }

  trackById(index: number, item: { id: string }): string {
    return item.id;
  }
}