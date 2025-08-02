import { MobileDetectionService } from '../service/mobile-detection.service';
import { Subscription } from 'rxjs';

export interface MobileDetectionMixin {
  isMobile: boolean;
  mobileDetectionService: MobileDetectionService;
  setupMobileDetection(): void;
}

export function MobileDetectionMixin<T extends new (...args: any[]) => {}>(Base: T) {
  return class extends Base implements MobileDetectionMixin {
    isMobile = false;
    mobileDetectionService!: MobileDetectionService;
    private mobileSubscription?: Subscription;

    setupMobileDetection() {
      if (this.mobileDetectionService) {
        this.mobileSubscription = this.mobileDetectionService.isMobile$.subscribe(isMobile => {
          this.isMobile = isMobile;
        });
      }
    }

    // Método para limpiar la suscripción
    cleanupMobileDetection() {
      if (this.mobileSubscription) {
        this.mobileSubscription.unsubscribe();
      }
    }

    // Getter para configuración de paginación
    get paginationConfig() {
      return this.mobileDetectionService?.paginationConfig || {
        defaultRows: 5,
        options: [5, 10, 15, 25]
      };
    }
  };
}
