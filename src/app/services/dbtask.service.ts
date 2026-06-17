import { Injectable } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { Storage } from '@ionic/storage-angular';

@Injectable({
    providedIn: 'root'
})
export class DbtaskService {
    private _storage: Storage | null = null;
    private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private usuarios: any[] = [];

    constructor(
        private storage: Storage,
        private platform: Platform,
        private toastController: ToastController
    ) {
        this.init();
    }

    async init() {
        await this.platform.ready();
        this._storage = await this.storage.create();
        await this.cargarUsuarios();
        this.isDbReady.next(true);
        console.log('DBTask inicializado correctamente');
    }

    private async cargarUsuarios() {
        const usuariosGuardados = await this._storage?.get('usuarios');
        if (usuariosGuardados) {
            this.usuarios = usuariosGuardados;
        } else {
            
            this.usuarios = [
                { user_name: 'demo@nurseshift.cl', password: '1234', active: 0 }
            ];
            await this._storage?.set('usuarios', this.usuarios);
        }
    }

    private async guardarUsuarios() {
        await this._storage?.set('usuarios', this.usuarios);
    }

    dbState(): Observable<boolean> {
        return this.isDbReady.asObservable();
    }

    async sesionActiva(): Promise<boolean> {
        const usuarioActivo = this.usuarios.find(u => u.active === 1);
        return usuarioActivo !== undefined;
    }

    async obtenerSesionActiva(): Promise<any> {
        return this.usuarios.find(u => u.active === 1) || null;
    }

    async validarUsuario(user_name: string): Promise<boolean> {
        return this.usuarios.some(u => u.user_name === user_name);
    }

    async validarCredenciales(user_name: string, password: string): Promise<boolean> {
        return this.usuarios.some(u => u.user_name === user_name && u.password === password);
    }

   
    
    async registrarUsuario(usuario: any): Promise<boolean> {
        const existe = this.usuarios.some(u => u.user_name === usuario.user_name);
        if (existe) {
            await this.presentToast('El usuario ya existe');
            return false;
        }

        this.usuarios.push({
            user_name: usuario.user_name,
            password: usuario.password,
            nombre: usuario.nombre || usuario.user_name, 
            active: 1
        });
        await this.guardarUsuarios();
        await this.presentToast('Usuario registrado correctamente');
        return true;
    }



    async activarSesion(user_name: string): Promise<boolean> {
        this.usuarios.forEach(u => u.active = 0);
        const usuario = this.usuarios.find(u => u.user_name === user_name);
        if (usuario) {
            usuario.active = 1;
            await this.guardarUsuarios();
            return true;
        }
        return false;
    }

    async cerrarSesion(): Promise<boolean> {
        this.usuarios.forEach(u => u.active = 0);
        await this.guardarUsuarios();
        await this.presentToast('Sesión cerrada correctamente');
        return true;
    }

    async presentToast(mensaje: string) {
        const toast = await this.toastController.create({
            message: mensaje,
            duration: 2000,
            position: 'bottom'
        });
        toast.present();
    }


    async obtenerNombreUsuario(user_name: string): Promise<string> {
        const usuario = this.usuarios.find(u => u.user_name === user_name);
        return usuario?.nombre || user_name || 'Usuario';
    }

}