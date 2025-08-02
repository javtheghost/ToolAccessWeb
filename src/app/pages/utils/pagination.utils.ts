import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaginationUtils {
  private isMobileSubject = new BehaviorSubject<boolean>(window.innerWidth <= 768);
  public isMobile$: Observable<boolean> = this.isMobileSubject.asObservable();

  constructor() {
    this.setupMobileDetection();
  }

  private setupMobileDetection() {
    window.addEventListener('resize', () => {
      this.isMobileSubject.next(window.innerWidth <= 768);
    });
  }

  get isMobile(): boolean {
    return this.isMobileSubject.value;
  }

  getPaginationConfig() {
    return {
      defaultRows: this.isMobile ? 3 : 5,
      options: this.isMobile ? [3, 5, 10] : [5, 10, 15, 25]
    };
  }

  // Método estático para uso directo
  static getConfig() {
    const isMobile = window.innerWidth <= 768;
    return {
      defaultRows: isMobile ? 3 : 5,
      options: isMobile ? [3, 5, 10] : [5, 10, 15, 25]
    };
  }
}
