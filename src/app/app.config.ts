import { MessageService } from 'primeng/api';

export const appConfig = {
  providers: [
    MessageService, // Necesario para servicios globales como OAuthService
    // ... otros providers ...
  ]
};
