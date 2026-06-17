// NURSESHIFT/src/app/pages/registro/registro.page.ts (MODIFICADO)
import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { DbtaskService } from '../../services/dbtask.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: false,
})
export class RegistroPage implements OnInit {
  nombre: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  rol: string = 'enfermera';

  errorNombre: string = '';
  errorEmail: string = '';
  errorPassword: string = '';
  errorConfirmPassword: string = '';
  errorGeneral: string = '';

  constructor(
    private navCtrl: NavController,
    private dbtaskService: DbtaskService,
    private storageService: StorageService
  ) { }

  ngOnInit() { }

  validarNombre(): boolean {
    if (!this.nombre) {
      this.errorNombre = 'El nombre completo es obligatorio';
      return false;
    } else if (this.nombre.trim().length < 3) {
      this.errorNombre = 'El nombre debe tener al menos 3 caracteres';
      return false;
    } else {
      this.errorNombre = '';
      return true;
    }
  }

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

  validarConfirmPassword(): boolean {
    if (!this.confirmPassword) {
      this.errorConfirmPassword = 'Debe confirmar su contraseña';
      return false;
    } else if (this.password !== this.confirmPassword) {
      this.errorConfirmPassword = 'Las contraseñas no coinciden';
      return false;
    } else {
      this.errorConfirmPassword = '';
      return true;
    }
  }

  async registrar() {
    this.errorGeneral = '';

    const nombreValido = this.validarNombre();
    const emailValido = this.validarEmail();
    const passwordValido = this.validarPassword();
    const confirmValido = this.validarConfirmPassword();

    if (!nombreValido || !emailValido || !passwordValido || !confirmValido) {
      this.errorGeneral = 'Por favor, corrija los errores antes de continuar';
      return;
    }
    
    const usuarioRegistrado = await this.dbtaskService.registrarUsuario({
      user_name: this.email,
      password: this.password,
      nombre: this.nombre, 
      email: this.email,
      rol: this.rol
    });


    if (!usuarioRegistrado) {
      this.errorGeneral = 'Error al registrar usuario. Intente nuevamente.';
      return;
    }

    // Guardar sesión en Storage
    await this.storageService.set('sesion_activa', {
      user_name: this.email,
      timestamp: new Date().toISOString()
    });

    console.log('Registrando usuario:', this.nombre, this.email, this.rol);
    this.navCtrl.navigateRoot('/home');
  }
}