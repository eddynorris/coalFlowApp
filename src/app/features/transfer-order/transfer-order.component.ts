import { Component, computed, inject, signal, OnInit, OnDestroy, ChangeDetectionStrategy, WritableSignal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DepotService } from '../../services/depot.service';
import { CoalTypeService } from '../../services/coal-type.service';
import { InventoryService } from '../../services/inventory.service';
import { TransferOrderService } from '../../services/transfer-order.service';
import { CityService } from '../../services/city.service'; // Para mostrar nombre de ciudad del depósito

import { TransferOrder } from '../../models/transfer-order.model';
import { Depot } from '../../models/depot.model';
import { CoalType } from '../../models/coal-type.model';

@Component({
  selector: 'app-transfer-order',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './transfer-order.component.html',
  styleUrls: ['./transfer-order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferOrderComponent implements OnInit, OnDestroy {
  // Inyección de servicios
  public depotService = inject(DepotService);
  public coalTypeService = inject(CoalTypeService);
  public cityService = inject(CityService); // Para nombres de ciudad
  private inventoryService = inject(InventoryService);
  public transferOrderService = inject(TransferOrderService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  transferForm: FormGroup;
  availableStock = signal<number | null>(null);
  isSubmitting = signal(false);
  
  // Para actualizar el validador de stock dinámicamente
  private stockSub: Subscription | undefined;

  // Columnas para la tabla de órdenes
  orderDisplayedColumns: string[] = ['fromDepot', 'toDepot', 'coalType', 'quantity', 'orderDate', 'status'];

  constructor() {
    this.transferForm = this.fb.group({
      fromDepotId: ['', Validators.required],
      toDepotId: ['', Validators.required],
      coalTypeId: ['', Validators.required],
      quantity: [null, [Validators.required, Validators.min(0.01)]] // Mínimo 0.01 toneladas
    }, { validators: this.depotsDifferentValidator });
  }

  ngOnInit(): void {
    // Escuchar cambios en depósito origen y tipo de carbón para actualizar stock disponible
    // y el validador de cantidad máxima.
    const fromDepotControl = this.transferForm.get('fromDepotId');
    const coalTypeControl = this.transferForm.get('coalTypeId');
    const quantityControl = this.transferForm.get('quantity');

    if (fromDepotControl && coalTypeControl && quantityControl) {
      this.stockSub = fromDepotControl.valueChanges.pipe(
        // debounceTime(300), // Opcional: esperar un poco antes de reaccionar
        distinctUntilChanged(),
        tap(() => this.updateAvailableStockAndValidator())
      ).subscribe();

      this.stockSub.add(
        coalTypeControl.valueChanges.pipe(
          // debounceTime(300),
          distinctUntilChanged(),
          tap(() => this.updateAvailableStockAndValidator())
        ).subscribe()
      );
    }
  }

  // Validador personalizado para asegurar que los depósitos sean diferentes
  depotsDifferentValidator(group: AbstractControl): ValidationErrors | null {
    const fromDepotId = group.get('fromDepotId')?.value;
    const toDepotId = group.get('toDepotId')?.value;
    return fromDepotId && toDepotId && fromDepotId === toDepotId ? { depotsSame: true } : null;
  }

  updateAvailableStockAndValidator(): void {
    const fromDepotId = this.transferForm.get('fromDepotId')?.value;
    const coalTypeId = this.transferForm.get('coalTypeId')?.value;
    const quantityControl = this.transferForm.get('quantity');

    if (fromDepotId && coalTypeId && quantityControl) {
      const stock = this.inventoryService.getStock(fromDepotId, coalTypeId);
      this.availableStock.set(stock);

      // Actualizar validadores para la cantidad
      quantityControl.setValidators([
        Validators.required,
        Validators.min(0.01),
        Validators.max(stock) // Valida contra el stock disponible
      ]);
      quantityControl.updateValueAndValidity({ emitEvent: false }); // No emitir evento para evitar bucles
    } else {
      this.availableStock.set(null);
      // Resetear validador de max si no hay suficiente info
      quantityControl?.setValidators([Validators.required, Validators.min(0.01)]);
      quantityControl?.updateValueAndValidity({ emitEvent: false });
    }
  }

  onSubmit(): void {
    if (this.transferForm.invalid) {
      this.snackBar.open('Formulario inválido. Por favor, revisa los campos.', 'Cerrar', { duration: 3000, panelClass: 'error-snackbar' });
      // Marcar todos los campos como tocados para mostrar errores
      Object.values(this.transferForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    this.isSubmitting.set(true);
    const orderData = this.transferForm.value;

    // Simular una pequeña demora para la operación
    setTimeout(() => {
      const result = this.transferOrderService.createTransferOrder(orderData);
      if (result) {
        this.snackBar.open('Orden de traslado creada exitosamente.', 'Cerrar', { duration: 3000, panelClass: 'success-snackbar' });
        this.transferForm.reset();
        // Resetear validadores y estado
        Object.keys(this.transferForm.controls).forEach(key => {
            this.transferForm.get(key)?.setErrors(null) ;
            this.transferForm.get(key)?.markAsUntouched();
            this.transferForm.get(key)?.markAsPristine();
        });
        this.availableStock.set(null);
        this.updateAvailableStockAndValidator(); // Para resetear el validador max
      } else {
        this.snackBar.open('Error al crear la orden de traslado. Verifica el stock o intenta más tarde.', 'Cerrar', { duration: 5000, panelClass: 'error-snackbar' });
      }
      this.isSubmitting.set(false);
    }, 500); // Simulación de demora
  }
  
  // Helper para obtener el nombre de la ciudad de un depósito
  getCityNameForDepot(depotId: string): string {
    const depot = this.depotService.getDepotById(depotId);
    return depot ? this.cityService.getCityById(depot.cityId)?.name || 'N/A' : 'N/A';
  }
  
  // Helper para obtener el nombre del depósito
  getDepotName(depotId: string): string {
    return this.depotService.getDepotById(depotId)?.name || 'Desconocido';
  }

  // Helper para obtener el nombre del tipo de carbón
  getCoalTypeName(coalTypeId: string): string {
    return this.coalTypeService.getCoalTypeById(coalTypeId)?.name || 'Desconocido';
  }

  trackOrderById(index: number, order: TransferOrder): string {
    return order.id;
  }

  ngOnDestroy(): void {
    this.stockSub?.unsubscribe();
  }
}