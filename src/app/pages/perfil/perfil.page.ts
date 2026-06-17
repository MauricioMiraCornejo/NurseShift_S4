import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { DbtaskService } from '../../services/dbtask.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false,
})
export class PerfilPage implements OnInit {
  
  nombre: string = 'Josefina Mira';
  email: string = 'josefina.mira@hospital.cl';
  telefono: string = '+56 9 1234 5678';
  rol: string = 'Enfermera Jefe';
  notificaciones: boolean = true;
  
  
  usuarioActual: string = '';

  constructor(
    private navCtrl: NavController,
    private dbtaskService: DbtaskService,
    private storageService: StorageService,
    private toastController: ToastController
  ) { }

  async ngOnInit() {
    
    await this.cargarDatosUsuario();
  }

  async cargarDatosUsuario() {
    try {
      
      const sesion = await this.dbtaskService.obtenerSesionActiva();
      if (sesion) {
        this.usuarioActual = sesion.user_name;
        this.email = sesion.user_name; 
        
        
        const nombreGuardado = await this.storageService.get('perfil_nombre');
        if (nombreGuardado) {
          this.nombre = nombreGuardado;
        }
        
        const telefonoGuardado = await this.storageService.get('perfil_telefono');
        if (telefonoGuardado) {
          this.telefono = telefonoGuardado;
        }
        
        const notificacionesGuardadas = await this.storageService.get('perfil_notificaciones');
        if (notificacionesGuardadas !== null) {
          this.notificaciones = notificacionesGuardadas;
        }
      }
    } catch (error) {
      console.error('Error al cargar datos del perfil:', error);
    }
  }

  async guardarCambios() {
    try {
      
      const toast = await this.toastController.create({
        message: 'Guardando cambios...',
        duration: 1000,
        position: 'bottom'
      });
      await toast.present();

      
      await this.storageService.set('perfil_nombre', this.nombre);
      await this.storageService.set('perfil_telefono', this.telefono);
      await this.storageService.set('perfil_notificaciones', this.notificaciones);
      
      
      const toastSuccess = await this.toastController.create({
        message: '✅ Cambios guardados correctamente',
        duration: 2000,
        position: 'bottom',
        color: 'success'
      });
      await toastSuccess.present();

      console.log('Guardando cambios del perfil:', {
        nombre: this.nombre,
        email: this.email,
        telefono: this.telefono,
        notificaciones: this.notificaciones
      });

    } catch (error) {
      console.error('Error al guardar cambios:', error);
      const toastError = await this.toastController.create({
        message: '❌ Error al guardar los cambios',
        duration: 2000,
        position: 'bottom',
        color: 'danger'
      });
      await toastError.present();
    }
  }

  async cerrarSesion() {
    
    const sesionCerrada = await this.dbtaskService.cerrarSesion();
    
    if (sesionCerrada) {
      
      await this.storageService.remove('sesion_activa');
            
      this.navCtrl.navigateRoot('/login');
    } else {
      console.error('Error al cerrar sesión');
    }
  }
}