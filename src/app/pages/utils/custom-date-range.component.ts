import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CustomDatePickerComponent } from './custom-date-picker.component';

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

@Component({
  selector: 'app-custom-date-range',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomDatePickerComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDateRangeComponent),
      multi: true
    }
  ],
  template: `
    <div class="date-range-container">
      <div class="date-range-inputs">
        <div class="date-input-wrapper">
          <app-custom-date-picker
            [(ngModel)]="startDate"
            [placeholder]="startPlaceholder"
            [maxDate]="endDate"
            (dateChange)="onStartDateChange($event)">
          </app-custom-date-picker>
        </div>

        <div class="date-separator">
          <span class="separator-text">{{ separatorText }}</span>
        </div>

        <div class="date-input-wrapper">
          <app-custom-date-picker
            [(ngModel)]="endDate"
            [placeholder]="endPlaceholder"
            [minDate]="startDate"
            (dateChange)="onEndDateChange($event)">
          </app-custom-date-picker>
        </div>
      </div>

      <div class="date-range-actions" *ngIf="showActions">
        <button type="button" class="action-btn today-btn" (click)="setTodayRange()">
          Hoy
        </button>
        <button type="button" class="action-btn week-btn" (click)="setWeekRange()">
          Esta semana
        </button>
        <button type="button" class="action-btn month-btn" (click)="setMonthRange()">
          Este mes
        </button>
        <button type="button" class="action-btn clear-btn" (click)="clearRange()">
          Limpiar
        </button>
      </div>
    </div>
  `,
  styles: [`
    .date-range-container {
      width: 100%;
    }

    .date-range-inputs {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .date-input-wrapper {
      flex: 1;
    }

    .date-separator {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 40px;
    }

    .separator-text {
      color: #6b7280;
      font-weight: 500;
      font-size: 14px;
    }

    .date-range-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .action-btn {
      padding: 6px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: #ffffff;
      color: #374151;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .action-btn:hover {
      background: #f9fafb;
      border-color: #9ca3af;
    }

    .today-btn {
      color: #174ea6;
      border-color: #174ea6;
    }

    .today-btn:hover {
      background: #174ea6;
      color: #ffffff;
    }

    .week-btn {
      color: #059669;
      border-color: #059669;
    }

    .week-btn:hover {
      background: #059669;
      color: #ffffff;
    }

    .month-btn {
      color: #dc2626;
      border-color: #dc2626;
    }

    .month-btn:hover {
      background: #dc2626;
      color: #ffffff;
    }

    .clear-btn {
      color: #6b7280;
      border-color: #d1d5db;
    }

    .clear-btn:hover {
      background: #f3f4f6;
      color: #374151;
    }

    @media (max-width: 768px) {
      .date-range-inputs {
        flex-direction: column;
        gap: 12px;
      }

      .date-separator {
        min-width: auto;
        display: none;
      }

      .date-range-actions {
        justify-content: center;
        flex-wrap: wrap;
      }

      .action-btn {
        flex: 1;
        min-width: 120px;
        text-align: center;
      }
    }

    @media (max-width: 480px) {
      .date-range-inputs {
        gap: 8px;
      }

      .date-range-actions {
        gap: 6px;
      }

      .action-btn {
        min-width: 100px;
        font-size: 11px;
        padding: 4px 8px;
      }
    }

    /* Additional responsive improvements */
    @media (max-width: 640px) {
      .date-range-container {
        width: 100%;
      }

      .date-input-wrapper {
        min-width: 0;
      }
    }

    /* Asegurar que los contenedores no corten el calendario */
    .date-range-container {
      overflow: visible !important;
    }

    .date-input-wrapper {
      overflow: visible !important;
      position: relative !important;
    }

    .date-range-inputs {
      overflow: visible !important;
    }
  `]
})
export class CustomDateRangeComponent implements ControlValueAccessor {
  @Input() startPlaceholder: string = 'Desde';
  @Input() endPlaceholder: string = 'Hasta';
  @Input() separatorText: string = 'a';
  @Input() showActions: boolean = true;
  @Output() rangeChange = new EventEmitter<DateRange>();

  startDate: Date | null = null;
  endDate: Date | null = null;

  private onChange = (value: DateRange) => {};
  private onTouched = () => {};

  writeValue(value: DateRange): void {
    if (value) {
      this.startDate = value.startDate;
      this.endDate = value.endDate;
    } else {
      this.startDate = null;
      this.endDate = null;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Implementar si es necesario
  }

  onStartDateChange(date: Date | null) {
    this.startDate = date;
    this.emitChange();
  }

  onEndDateChange(date: Date | null) {
    this.endDate = date;
    this.emitChange();
  }

  setTodayRange() {
    const today = new Date();
    this.startDate = today;
    this.endDate = today;
    this.emitChange();
  }

  setWeekRange() {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    this.startDate = startOfWeek;
    this.endDate = endOfWeek;
    this.emitChange();
  }

  setMonthRange() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.startDate = startOfMonth;
    this.endDate = endOfMonth;
    this.emitChange();
  }

  clearRange() {
    this.startDate = null;
    this.endDate = null;
    this.emitChange();
  }

  private emitChange() {
    const range: DateRange = {
      startDate: this.startDate,
      endDate: this.endDate
    };
    this.onChange(range);
    this.rangeChange.emit(range);
    this.onTouched();
  }
}
