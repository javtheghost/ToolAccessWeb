import { Directive, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { Table } from 'primeng/table';
import { MobileDetectionService } from '../service/mobile-detection.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appResponsivePagination]',
  standalone: true
})
export class ResponsivePaginationDirective implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();

  constructor(
    private el: ElementRef,
    private mobileDetectionService: MobileDetectionService
  ) {}

  ngOnInit() {
    // Encontrar la tabla PrimeNG
    const table = this.el.nativeElement.querySelector('p-table');
    if (table) {
      this.setupResponsivePagination(table);
    }
  }

  private setupResponsivePagination(table: any) {
    this.subscription.add(
      this.mobileDetectionService.isMobile$.subscribe(isMobile => {
        const config = this.mobileDetectionService.paginationConfig;

        // Actualizar configuración de paginación
        if (table.componentInstance) {
          table.componentInstance.rows = config.defaultRows;
          table.componentInstance.rowsPerPageOptions = config.options;
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
