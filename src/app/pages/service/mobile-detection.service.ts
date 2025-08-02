import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MobileDetectionService {
  private isMobileSubject = new BehaviorSubject<boolean>(window.innerWidth <= 768);
  public isMobile$: Observable<boolean> = this.isMobileSubject.asObservable();

  constructor() {
    this.setupMobileDetection();
  }

  private setupMobileDetection() {
    // Detectar cambios en el tamaño de la ventana
    window.addEventListener('resize', () => {
      this.isMobileSubject.next(window.innerWidth <= 768);
    });
  }

  get isMobile(): boolean {
    return this.isMobileSubject.value;
  }

  get paginationConfig() {
    return {
      defaultRows: this.isMobile ? 3 : 5,
      options: this.isMobile ? [3, 5, 10] : [5, 10, 15, 25]
    };
  }
}
