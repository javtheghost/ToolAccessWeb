import { Component } from '@angular/core';
import { AppTopbar } from "../../../layout/component/app.topbar";
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OAuthService } from '../../service/oauth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [AppTopbar, RouterModule, FormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  password: string = '';
  showPassword: boolean = false;

  constructor(private oauthService: OAuthService) {
    console.log('🔧 LoginComponent inicializado');
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  loginOAuth() {
    console.log('🚀 LoginComponent: Iniciando login OAuth...');
    this.oauthService.login();
  }
}
