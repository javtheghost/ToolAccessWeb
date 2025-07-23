import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppTopbar } from '../../layout/component/app.topbar';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [CommonModule, AppTopbar, ButtonModule, RouterModule],
  template: `
    <app-topbar [minimal]="true"></app-topbar>
    <div class="error-container">
      <img [src]="image" alt="Error" class="error-image" />
      <h1>Error {{ code }}</h1>
      <p>{{ message }}</p>
      <p-button label="Volver al inicio" icon="pi pi-home" routerLink="/"></p-button>
    </div>
  `,
  styles: [
    `.error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 80px);
      text-align: center;
    }
    .error-image {
      max-width: 300px;
      margin-bottom: 2rem;
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
    p {
      font-size: 1.2rem;
      margin-bottom: 2rem;
    }
    button, p-button {
      margin-bottom: 1rem;
    }
    `
  ]
})
export class ErrorPageComponent {
  code: string = '';
  message: string = '';
  image: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.code = params.get('code') || 'Error';
      switch (this.code) {
        case '401':
          this.message = 'No autorizado. Por favor, inicia sesión o verifica tus permisos.';
          this.image = 'assets/errors/401_unauthorized.svg';
          break;
        case '404':
          this.message = 'Página no encontrada. La URL no existe.';
          this.image = 'assets/errors/404_not_found.svg';
          break;
        case '500':
          this.message = 'Error interno del servidor. Intenta más tarde.';
          this.image = 'assets/errors/500_server_error.svg';
          break;
        case '502':
          this.message = 'Bad Gateway. El servidor no pudo procesar la solicitud.';
          this.image = 'assets/errors/502_bad_gateway.svg';
          break;
        default:
          this.message = 'Ha ocurrido un error inesperado.';
          this.image = 'assets/errors/500_server_error.svg';
      }
    });
  }
}
