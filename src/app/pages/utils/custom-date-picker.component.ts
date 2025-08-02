import { Component, Input, Output, EventEmitter, forwardRef, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-custom-date-picker',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDatePickerComponent),
      multi: true
    }
  ],
  template: `
    <div class="custom-date-picker" [class.focused]="isFocused" [class.has-value]="hasValue">
      <div class="date-input-container" (click)="toggleCalendar()">
        <svg class="calendar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 3H18V1H16V3H8V1H6V3H5C3.89 3 3.01 3.9 3.01 5L3 19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19ZM7 10H12V15H7V10Z" fill="currentColor"/>
        </svg>
        <input
          type="text"
          [value]="displayValue"
          [placeholder]="placeholder"
          (focus)="onInputFocus()"
          (blur)="onInputBlur()"
          (input)="onInputChange($event)"
          (keydown)="onInputKeydown($event)"
          class="date-input"
          [readonly]="false"
        />
        <svg class="dropdown-icon" [class.rotated]="isOpen" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 10l5 5 5-5z" fill="currentColor"/>
        </svg>
      </div>

      <div class="calendar-dropdown" *ngIf="isOpen" (click)="$event.stopPropagation()">
        <div class="calendar-header">
          <button class="nav-btn" (click)="previousMonth()" type="button">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor"/>
            </svg>
          </button>
          <div class="current-month" (click)="toggleYearPicker()">
            <span class="month-text">{{ getMonthText() }}</span>
            <span class="year-text">{{ getYearText() }}</span>
          </div>
          <button class="nav-btn" (click)="nextMonth()" type="button">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" fill="currentColor"/>
            </svg>
          </button>
        </div>

        <div class="year-picker" *ngIf="showYearPicker">
          <div class="year-picker-header">
            <button class="nav-btn" (click)="previousYearRange()" type="button">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor"/>
              </svg>
            </button>
            <div class="year-range">{{ getYearRangeText() }}</div>
            <button class="nav-btn" (click)="nextYearRange()" type="button">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" fill="currentColor"/>
              </svg>
            </button>
          </div>
          <div class="year-grid">
            <div
              *ngFor="let year of yearOptions"
              class="year-option"
              [class.selected]="year === currentMonth.getFullYear()"
              [class.current-year]="year === getCurrentYear()"
              (click)="selectYear(year)">
              {{ year }}
            </div>
          </div>
        </div>

        <div class="calendar-weekdays">
          <div class="weekday" *ngFor="let day of weekdays">{{ day }}</div>
        </div>

        <div class="calendar-days">
          <div
            *ngFor="let day of calendarDays"
            class="calendar-day"
            [class.other-month]="!day.isCurrentMonth"
            [class.selected]="day.isSelected"
            [class.today]="day.isToday"
            [class.disabled]="day.isDisabled"
            (click)="selectDate(day)"
          >
            {{ day.dayNumber }}
          </div>
        </div>

        <div class="calendar-footer">
          <button class="today-btn" (click)="selectToday()" type="button">Hoy</button>
          <button class="clear-btn" (click)="clearDate()" type="button">Limpiar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-date-picker {
      position: relative;
      width: 100%;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .date-input-container {
      position: relative;
      display: flex;
      align-items: center;
      background: #ffffff;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 0 12px;
      height: 48px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .date-input-container:hover {
      border-color: #9ca3af;
    }

    .date-input-container.focused {
      border-color: #174ea6;
      box-shadow: 0 0 0 3px rgba(23, 78, 166, 0.1);
    }

    .date-input-container.focused .date-input {
      cursor: text;
    }

    .calendar-icon {
      width: 20px;
      height: 20px;
      color: #6b7280;
      margin-right: 8px;
      flex-shrink: 0;
    }

    .date-input {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      font-size: 14px;
      color: #374151;
      cursor: text;
    }

    .date-input::placeholder {
      color: #9ca3af;
    }

    .dropdown-icon {
      width: 16px;
      height: 16px;
      color: #6b7280;
      transition: transform 0.2s ease;
      flex-shrink: 0;
    }

    .dropdown-icon.rotated {
      transform: rotate(180deg);
    }

    .calendar-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      z-index: 1000;
      margin-top: 4px;
      min-width: 280px;
    }

    .calendar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid #f3f4f6;
    }

    .nav-btn {
      background: none;
      border: none;
      padding: 8px;
      border-radius: 6px;
      cursor: pointer;
      color: #6b7280;
      transition: all 0.2s ease;
    }

    .nav-btn:hover {
      background: #f3f4f6;
      color: #374151;
    }

    .nav-btn svg {
      width: 16px;
      height: 16px;
    }

    .current-month {
      font-weight: 600;
      color: #374151;
      font-size: 14px;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 6px;
      transition: background-color 0.2s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .current-month:hover {
      background: #f3f4f6;
    }

    .month-text {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }

    .year-text {
      font-size: 12px;
      color: #6b7280;
      font-weight: 500;
    }

    .calendar-weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      padding: 8px 16px 0;
    }

    .weekday {
      text-align: center;
      font-size: 12px;
      font-weight: 500;
      color: #6b7280;
      padding: 8px 0;
    }

    .calendar-days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      padding: 0 16px 16px;
    }

    .calendar-day {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 36px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      color: #374151;
      transition: all 0.2s ease;
      margin: 2px;
    }

    .calendar-day:hover:not(.disabled) {
      background: #f3f4f6;
    }

    .calendar-day.selected {
      background: #174ea6;
      color: #ffffff;
    }

    .calendar-day.today {
      border: 2px solid #174ea6;
      font-weight: 600;
    }

    .calendar-day.other-month {
      color: #9ca3af;
    }

    .calendar-day.disabled {
      color: #d1d5db;
      cursor: not-allowed;
    }

    .calendar-footer {
      display: flex;
      justify-content: space-between;
      padding: 12px 16px;
      border-top: 1px solid #f3f4f6;
      gap: 8px;
    }

    .today-btn, .clear-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .today-btn {
      background: #174ea6;
      color: #ffffff;
    }

    .today-btn:hover {
      background: #0d3576;
    }

    .clear-btn {
      background: #f3f4f6;
      color: #6b7280;
    }

    .clear-btn:hover {
      background: #e5e7eb;
    }

    .has-value .date-input {
      color: #374151;
    }

    .year-picker {
      border-bottom: 1px solid #f3f4f6;
      padding: 16px;
    }

    .year-picker-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .year-range {
      font-weight: 600;
      color: #374151;
      font-size: 14px;
    }

    .year-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }

    .year-option {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 36px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      color: #374151;
      transition: all 0.2s ease;
      border: 1px solid transparent;
    }

    .year-option:hover {
      background: #f3f4f6;
    }

    .year-option.selected {
      background: #174ea6;
      color: #ffffff;
      border-color: #174ea6;
    }

    .year-option.current-year {
      border-color: #174ea6;
      font-weight: 600;
    }

    .year-option.current-year:not(.selected) {
      color: #174ea6;
    }
  `]
})
export class CustomDatePickerComponent implements OnInit, ControlValueAccessor {
  @Input() placeholder: string = 'Seleccionar fecha';
  @Input() disabled: boolean = false;
  @Input() minDate: Date | null = null;
  @Input() maxDate: Date | null = null;
  @Output() dateChange = new EventEmitter<Date | null>();

  constructor(private elementRef: ElementRef) {}

  isOpen = false;
  isFocused = false;
  hasValue = false;
  displayValue = '';
  selectedDate: Date | null = null;
  currentMonth = new Date();
  showYearPicker = false;

  weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  calendarDays: any[] = [];
  yearOptions: number[] = [];

  private onChange = (value: Date | null) => {};
  private onTouched = () => {};

  ngOnInit() {
    this.generateCalendar();
  }

  writeValue(value: Date | null): void {
    this.selectedDate = value;
    this.updateDisplayValue();
    this.generateCalendar();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  toggleCalendar() {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.generateCalendar();
      this.showYearPicker = false;
    }
  }

  onInputFocus() {
    this.isFocused = true;
    this.onTouched();
  }

  onInputBlur() {
    this.isFocused = false;

    // Validar y aplicar la fecha escrita cuando el input pierde el foco
    if (this.displayValue.trim()) {
      const parsedDate = this.parseDateFromInput(this.displayValue);
      if (parsedDate) {
        this.selectedDate = parsedDate;
        this.updateDisplayValue(); // Formatear correctamente la fecha
        this.onChange(this.selectedDate);
        this.dateChange.emit(this.selectedDate);
        this.generateCalendar();
      } else {
        // Si la fecha no es válida, restaurar el valor anterior o limpiar
        this.updateDisplayValue();
      }
    }
  }

  onInputChange(event: any) {
    const value = event.target.value;
    this.displayValue = value;

    // Si el input está vacío, limpiar la fecha seleccionada
    if (!value.trim()) {
      this.selectedDate = null;
      this.hasValue = false;
      this.onChange(null);
      this.dateChange.emit(null);
      return;
    }

    // Intentar parsear la fecha escrita
    const parsedDate = this.parseDateFromInput(value);
    if (parsedDate) {
      this.selectedDate = parsedDate;
      this.hasValue = true;
      this.onChange(this.selectedDate);
      this.dateChange.emit(this.selectedDate);
      this.generateCalendar();
    }
  }

  onInputKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.isOpen = false;
      this.showYearPicker = false;
      // Validar y aplicar la fecha escrita
      const parsedDate = this.parseDateFromInput(this.displayValue);
      if (parsedDate) {
        this.selectedDate = parsedDate;
        this.onChange(this.selectedDate);
        this.dateChange.emit(this.selectedDate);
        this.generateCalendar();
      }
    }
  }

  generateCalendar() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    this.calendarDays = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayNumber = currentDate.getDate();
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = this.isToday(currentDate);
      const isSelected = this.selectedDate && this.isSameDay(currentDate, this.selectedDate);
      const isDisabled = this.isDateDisabled(currentDate);

      this.calendarDays.push({
        date: new Date(currentDate),
        dayNumber,
        isCurrentMonth,
        isToday,
        isSelected,
        isDisabled
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  selectDate(day: any) {
    if (day.isDisabled) return;

    this.selectedDate = day.date;
    this.updateDisplayValue();
    this.onChange(this.selectedDate);
    this.dateChange.emit(this.selectedDate);
    this.isOpen = false;
    this.showYearPicker = false;
  }

  selectToday() {
    this.selectedDate = new Date();
    this.updateDisplayValue();
    this.onChange(this.selectedDate);
    this.dateChange.emit(this.selectedDate);
    this.isOpen = false;
  }

  clearDate() {
    this.selectedDate = null;
    this.updateDisplayValue();
    this.onChange(null);
    this.dateChange.emit(null);
    this.isOpen = false;
  }

  previousMonth() {
    this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
    this.generateCalendar();
  }

  getMonthYearText(): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${months[this.currentMonth.getMonth()]} ${this.currentMonth.getFullYear()}`;
  }

  getMonthText(): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[this.currentMonth.getMonth()];
  }

  getYearText(): string {
    return this.currentMonth.getFullYear().toString();
  }

  toggleYearPicker() {
    this.showYearPicker = !this.showYearPicker;
    if (this.showYearPicker) {
      this.generateYearOptions();
    }
  }

  generateYearOptions() {
    const currentYear = this.currentMonth.getFullYear();
    const startYear = Math.floor(currentYear / 10) * 10;
    this.yearOptions = [];

    for (let i = startYear - 5; i <= startYear + 15; i++) {
      this.yearOptions.push(i);
    }
  }

  getYearRangeText(): string {
    const startYear = Math.floor(this.currentMonth.getFullYear() / 10) * 10;
    return `${startYear - 5}-${startYear + 15}`;
  }

  previousYearRange() {
    const currentYear = this.currentMonth.getFullYear();
    this.currentMonth.setFullYear(currentYear - 10);
    this.generateYearOptions();
  }

  nextYearRange() {
    const currentYear = this.currentMonth.getFullYear();
    this.currentMonth.setFullYear(currentYear + 10);
    this.generateYearOptions();
  }

  selectYear(year: number) {
    this.currentMonth.setFullYear(year);
    this.showYearPicker = false;
    this.generateCalendar();
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  private updateDisplayValue() {
    if (this.selectedDate) {
      this.displayValue = this.formatDate(this.selectedDate);
      this.hasValue = true;
    } else {
      this.displayValue = '';
      this.hasValue = false;
    }
  }

  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return this.isSameDay(date, today);
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  private isDateDisabled(date: Date): boolean {
    if (this.minDate && date < this.minDate) return true;
    if (this.maxDate && date > this.maxDate) return true;
    return false;
  }

  private parseDateFromInput(inputValue: string): Date | null {
    if (!inputValue || !inputValue.trim()) {
      return null;
    }

    // Remover espacios y caracteres extra
    const cleanValue = inputValue.trim().replace(/\s+/g, '');

    // Patrones de fecha soportados
    const patterns = [
      // DD/MM/YYYY
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      // DD-MM-YYYY
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
      // DD.MM.YYYY
      /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/,
      // YYYY-MM-DD
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
      // DD/MM/YY (año de 2 dígitos)
      /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/,
      // DD-MM-YY
      /^(\d{1,2})-(\d{1,2})-(\d{2})$/
    ];

    for (const pattern of patterns) {
      const match = cleanValue.match(pattern);
      if (match) {
        let day, month, year;

        if (pattern.source.includes('YYYY')) {
          // Formato con año de 4 dígitos
          [, day, month, year] = match;
        } else {
          // Formato con año de 2 dígitos
          [, day, month, year] = match;
          // Convertir año de 2 dígitos a 4 dígitos
          const currentYear = new Date().getFullYear();
          const yearPrefix = Math.floor(currentYear / 100);
          year = parseInt(year.toString()) + (parseInt(year.toString()) < 50 ? yearPrefix * 100 : (yearPrefix - 1) * 100);
        }

        day = parseInt(day.toString());
        month = parseInt(month.toString()) - 1; // Los meses en JavaScript van de 0-11
        year = parseInt(year.toString());

        // Validar rangos
        if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1900 || year > 2100) {
          continue;
        }

        // Crear la fecha
        const date = new Date(year, month, day);

        // Verificar que la fecha sea válida (por ejemplo, 31/02/2024 no es válida)
        if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
          continue;
        }

        // Verificar restricciones de fecha mínima y máxima
        if (this.isDateDisabled(date)) {
          continue;
        }

        return date;
      }
    }

    return null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!this.elementRef?.nativeElement?.contains(target)) {
      this.isOpen = false;
    }
  }
}
