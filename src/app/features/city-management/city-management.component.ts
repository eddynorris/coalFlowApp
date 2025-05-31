import { Component, computed, inject, signal, WritableSignal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { City } from '../../models/city.model';
import { CityService } from '../../services/city.service';
import { Depot } from '../../models/depot.model';
import { DepotService } from '../../services/depot.service';
import { InventoryService } from '../../services/inventory.service'; // Importar InventoryService
import { CoalTypeService } from '../../services/coal-type.service'; // Importar CoalTypeService

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
    MatTooltipModule
  ],
  templateUrl: './city-management.component.html',
  styleUrls: ['./city-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideInOut', [
      state('in', style({
        height: '*',
        opacity: 1,
        overflow: 'visible',
        'margin-top': '24px'
      })),
      state('out', style({
        height: '0px',
        opacity: 0,
        overflow: 'hidden',
        'margin-top': '0px'
      })),
      transition('in <=> out', animate('300ms ease-in-out'))
    ])
  ]
})
export class CityManagementComponent {
  public cityService = inject(CityService);
  public depotService = inject(DepotService);
  private inventoryService = inject(InventoryService); // Inyectar InventoryService
  private coalTypeService = inject(CoalTypeService);   // Inyectar CoalTypeService
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  showCityForm = signal(false);
  editingCityId: WritableSignal<string | null> = signal(null);
  cityForm: FormGroup;

  showDepotForm = signal(false);
  editingDepotId: WritableSignal<string | null> = signal(null);
  depotForm: FormGroup;

  cityForDepotDisplay: WritableSignal<City | null> = signal(null);

  depotsForSelectedCity = computed(() => {
    const currentCity = this.cityForDepotDisplay();
    if (!currentCity) {
      return [];
    }
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
    this.cityForDepotDisplay.set(null);
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
      this.snackBar.open('Por favor, corrige los errores en el formulario de ciudad.', 'Cerrar', { duration: 3000, panelClass: 'error-snackbar' });
      return;
    }
    const cityName = this.cityForm.value.name;
    const currentEditingCityId = this.editingCityId();

    if (currentEditingCityId) {
      this.cityService.updateCity({ id: currentEditingCityId, name: cityName });
      this.snackBar.open(`Ciudad "${cityName}" actualizada correctamente.`, 'Cerrar', { duration: 3000, panelClass: 'success-snackbar' });
    } else {
      this.cityService.addCity(cityName);
      this.snackBar.open(`Ciudad "${cityName}" creada correctamente.`, 'Cerrar', { duration: 3000, panelClass: 'success-snackbar' });
    }
    this.closeCityForm();
  }

  closeCityForm(): void {
    this.showCityForm.set(false);
    this.editingCityId.set(null);
    this.cityForm.reset();
  }

  editCity(cityToEdit: City, event: MouseEvent): void {
    event.stopPropagation();
    this.openCityForm(cityToEdit);
  }

  confirmDeleteCity(cityToDelete: City, event: MouseEvent): void {
    event.stopPropagation();

    const depotsInCity = this.depotService.getDepotsByCityId(cityToDelete.id);
    let cityHasInventory = false;

    for (const depot of depotsInCity) {
      for (const coalType of this.coalTypeService.coalTypes()) {
        if (this.inventoryService.getStock(depot.id, coalType.id) > 0) {
          cityHasInventory = true;
          break;
        }
      }
      if (cityHasInventory) {
        break;
      }
    }

    if (cityHasInventory) {
      this.snackBar.open(
        `No se puede eliminar la ciudad "${cityToDelete.name}" porque uno o más de sus depósitos tienen inventario.`,
        'Cerrar',
        { duration: 5000, panelClass: 'error-snackbar' }
      );
      return;
    }

    if (confirm(`¿Estás seguro de eliminar la ciudad "${cityToDelete.name}"? Esto también eliminará todos sus depósitos asociados (ya que no tienen inventario).`)) {
      // Eliminar primero los depósitos (que ya sabemos que no tienen inventario)
      depotsInCity.forEach(depot => this.depotService.deleteDepot(depot.id));
      // Luego eliminar la ciudad
      this.cityService.deleteCity(cityToDelete.id);
      this.snackBar.open(`Ciudad "${cityToDelete.name}" y sus depósitos eliminados.`, 'Cerrar', { duration: 3000, panelClass: 'success-snackbar' });

      if (this.cityForDepotDisplay()?.id === cityToDelete.id) {
        this.cityForDepotDisplay.set(null);
      }
    }
  }

  toggleDepotDisplay(city: City, event?: MouseEvent): void {
    event?.stopPropagation();
    this.closeCityForm();
    this.closeDepotForm();

    if (this.cityForDepotDisplay()?.id === city.id) {
      this.cityForDepotDisplay.set(null);
    } else {
      this.cityForDepotDisplay.set(city);
    }
  }

  openDepotForm(depotToEdit?: Depot): void {
    const currentCityForDepots = this.cityForDepotDisplay();
    if (!currentCityForDepots) {
      this.snackBar.open('Error: No hay ciudad seleccionada para el depósito.', 'Cerrar', { duration: 3000, panelClass: 'error-snackbar' });
      return;
    }
    this.showCityForm.set(false);
    this.showDepotForm.set(true);
    if (depotToEdit) {
      this.editingDepotId.set(depotToEdit.id);
      this.depotForm.patchValue({ name: depotToEdit.name });
    } else {
      this.editingDepotId.set(null);
      this.depotForm.reset();
    }
  }

  saveDepot(): void {
    const currentSelectedCity = this.cityForDepotDisplay();
    if (this.depotForm.invalid || !currentSelectedCity) {
      this.snackBar.open('Por favor, corrige los errores o asegúrate de que una ciudad esté seleccionada.', 'Cerrar', { duration: 3000, panelClass: 'error-snackbar' });
      return;
    }

    const depotName = this.depotForm.value.name;
    const cityId = currentSelectedCity.id;
    const currentEditingDepotId = this.editingDepotId();

    if (currentEditingDepotId) {
      this.depotService.updateDepot({ id: currentEditingDepotId, name: depotName, cityId });
      this.snackBar.open(`Depósito "${depotName}" actualizado.`, 'Cerrar', { duration: 3000, panelClass: 'success-snackbar' });
    } else {
      this.depotService.addDepot(depotName, cityId);
      this.snackBar.open(`Depósito "${depotName}" agregado a ${currentSelectedCity.name}.`, 'Cerrar', { duration: 3000, panelClass: 'success-snackbar' });
    }
    this.closeDepotForm();
  }

  closeDepotForm(): void {
    this.showDepotForm.set(false);
    this.editingDepotId.set(null);
    this.depotForm.reset();
  }

  editDepot(depotToEdit: Depot, event: MouseEvent): void {
    event.stopPropagation();
    this.openDepotForm(depotToEdit);
  }

  confirmDeleteDepot(depotToDelete: Depot, event: MouseEvent): void {
    event.stopPropagation();
    // Validar si el depósito individual tiene stock
    let depotHasInventory = false;
    for (const coalType of this.coalTypeService.coalTypes()) {
        if (this.inventoryService.getStock(depotToDelete.id, coalType.id) > 0) {
            depotHasInventory = true;
            break;
        }
    }

    if (depotHasInventory) {
        this.snackBar.open(
            `No se puede eliminar el depósito "${depotToDelete.name}" porque tiene inventario.`,
            'Cerrar',
            { duration: 5000, panelClass: 'error-snackbar' }
        );
        return;
    }

    if (confirm(`¿Estás seguro de eliminar el depósito "${depotToDelete.name}"?`)) {
      this.depotService.deleteDepot(depotToDelete.id);
      this.snackBar.open(`Depósito "${depotToDelete.name}" eliminado.`, 'Cerrar', { duration: 3000, panelClass: 'success-snackbar' });
    }
  }

  trackById(index: number, item: { id: string }): string {
    return item.id;
  }
}