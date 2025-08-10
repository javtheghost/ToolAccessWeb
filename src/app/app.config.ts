import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { TokenInterceptor } from './pages/interceptors/token.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([ErrorInterceptor, TokenInterceptor])
    ),
    provideAnimations(),
    MessageService,
    ConfirmationService
  ]
};
