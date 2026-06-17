import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { DbtaskService } from '../../services/dbtask.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';

  errorEmail: string = '';
  errorPassword: string = '';
  errorGeneral: string = '';

  constructor(
    private navCtrl: NavController,
    private dbtaskService: DbtaskService,
    private storageService: StorageService
  ) { }

  ngOnInit() { }

  validarEmail(): boolean {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!this.email) {
      this.errorEmail = 'El correo es obligatorio';
      return false;
    } else if (!emailRegex.test(this.email)) {
      this.errorEmail = 'Ingrese un correo válido (ej: nombre@dominio.com)';
      return false;
    } else {
      this.errorEmail = '';
      return true;
    }
  }

  validarPassword(): boolean {
    if (!this.password) {
      this.errorPassword = 'La contraseña es obligatoria';
      return false;
    } else if (this.password.length < 4) {
      this.errorPassword = 'La contraseña debe tener al menos 4 caracteres';
      return false;
    } else {
      this.errorPassword = '';
      return true;
    }
  }

  async login() {
    this.errorGeneral = '';

    const emailValido = this.validarEmail();
    const passwordValido = this.validarPassword();

    if (!emailValido || !passwordValido) {
      this.errorGeneral = 'Por favor, corrija los errores antes de continuar';
      return;
    }

    const credencialesValidas = await this.dbtaskService.validarCredenciales(this.email, this.password);
    
    if (!credencialesValidas) {
      this.errorGeneral = 'Usuario o contraseña incorrectos';
      return;
    }
    
    const sesionActivada = await this.dbtaskService.activarSesion(this.email);
    
    if (!sesionActivada) {
      this.errorGeneral = 'Error al iniciar sesión. Intente nuevamente.';
      return;
    }
    
    await this.storageService.set('sesion_activa', {
      user_name: this.email,
      timestamp: new Date().toISOString()
    });

    console.log('Login exitoso:', this.email);
    this.navCtrl.navigateForward('/home');
  }
}