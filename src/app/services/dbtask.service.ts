import { Injectable } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class DbtaskService {
  private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private usuarios: any[] = [];
  private usuarioActual: any = null;
  private isWeb: boolean = false;

  constructor(
    private storage: Storage,
    private platform: Platform,
    private toastController: ToastController,
    private databaseService: DatabaseService
  ) {
    this.isWeb = !this.platform.is('android') && !this.platform.is('ios');
    console.log('DbtaskService - isWeb:', this.isWeb);
    this.init();
  }

  async init() {
    await this.platform.ready();
    await this.storage.create();
    
    if (this.isWeb) {
      console.log('Web: Usando Storage para datos');
      await this.cargarUsuariosWeb();
      this.isDbReady.next(true);
      console.log('DBTask inicializado en modo Web con Storage');
      return;
    }
    
    console.log('DBTask - Inicializando en modo Android...');
    await this.databaseService.initDatabase();
    console.log('DBTask - DatabaseService inicializado');
    
    await this.migrarDatosStorageASQLite();
    console.log('DBTask - Migración completada');
    
    await this.cargarUsuarios();
    console.log('DBTask - Usuarios cargados:', this.usuarios.length);
    
    this.isDbReady.next(true);
    console.log('DBTask inicializado correctamente con Capacitor SQLite');
  }

  private async cargarUsuariosWeb() {
    try {
      const usuariosStorage = await this.storage.get('db_usuarios');
      if (usuariosStorage && usuariosStorage.length > 0) {
        this.usuarios = usuariosStorage;
        this.usuarioActual = this.usuarios.find(u => u.active === 1) || null;
        console.log(`${this.usuarios.length} usuarios cargados desde Storage`);
      } else {
        const userDefault = {
          id: 1,
          user_name: 'test@test.cl',
          password: '1234',
          nombre: 'Usuario Test',
          email: 'test@test.cl',
          rol: 'enfermera',
          active: 1
        };
        this.usuarios = [userDefault];
        this.usuarioActual = userDefault;
        await this.storage.set('db_usuarios', this.usuarios);
        console.log('Usuario de prueba creado en Storage');
      }
    } catch (error) {
      console.error('Error cargando usuarios desde Storage:', error);
      this.usuarios = [];
    }
  }

  private async guardarUsuariosWeb() {
    try {
      await this.storage.set('db_usuarios', this.usuarios);
      console.log('Usuarios guardados en Storage');
    } catch (error) {
      console.error('Error guardando usuarios en Storage:', error);
    }
  }

  private async migrarDatosStorageASQLite() {
    if (this.isWeb) {
      console.log('Web: No se migra a SQLite');
      return;
    }

    try {
      const migrado = await this.storage.get('migracion_realizada_sqlite_capacitor');
      if (migrado) {
        console.log('Migración ya realizada previamente');
        return;
      }

      console.log('Iniciando migración de datos a Capacitor SQLite...');

      const usuariosStorage = await this.storage.get('usuarios');
      if (usuariosStorage && usuariosStorage.length > 0) {
        for (const usuario of usuariosStorage) {
          try {
            await this.databaseService.executeNonQuery(
              `INSERT OR REPLACE INTO usuarios (user_name, password, nombre, email, rol, active)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [
                usuario.user_name,
                usuario.password,
                usuario.nombre || usuario.user_name,
                usuario.email || usuario.user_name,
                usuario.rol || 'enfermera',
                usuario.active || 0
              ]
            );
          } catch (error) {
            console.error('Error migrando usuario:', usuario, error);
          }
        }
        console.log(`Migrados ${usuariosStorage.length} usuarios a Capacitor SQLite`);
      }

      await this.storage.set('migracion_realizada_sqlite_capacitor', true);
      console.log('Migración completada exitosamente a Capacitor SQLite');
    } catch (error) {
      console.error('Error en migración:', error);
    }
  }

  private async cargarUsuarios() {
    try {
      console.log('Cargando usuarios desde SQLite...');
      const result = await this.databaseService.executeQuery(
        'SELECT * FROM usuarios ORDER BY id ASC',
        []
      );
      
      this.usuarios = [];
      for (let i = 0; i < result.rows.length; i++) {
        this.usuarios.push(result.rows.item(i));
      }

      this.usuarioActual = this.usuarios.find(u => u.active === 1) || null;
      
      console.log(`${this.usuarios.length} usuarios cargados desde Capacitor SQLite`);
      console.log('Usuario actual:', this.usuarioActual ? this.usuarioActual.user_name : 'Ninguno');
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      this.usuarios = [];
    }
  }

  private async recargarUsuarios() {
    if (this.isWeb) {
      await this.cargarUsuariosWeb();
    } else {
      await this.cargarUsuarios();
    }
  }

  dbState(): Observable<boolean> {
    return this.isDbReady.asObservable();
  }

  async sesionActiva(): Promise<boolean> {
    if (this.isWeb) {
      await this.cargarUsuariosWeb();
    } else {
      await this.cargarUsuarios();
    }
    return this.usuarioActual !== null;
  }

  async obtenerSesionActiva(): Promise<any> {
    if (this.isWeb) {
      await this.cargarUsuariosWeb();
    } else {
      await this.cargarUsuarios();
    }
    return this.usuarioActual;
  }

  async validarUsuario(user_name: string): Promise<boolean> {
    if (this.isWeb) {
      await this.cargarUsuariosWeb();
      return this.usuarios.some(u => u.user_name === user_name);
    }

    try {
      console.log('Validando usuario en SQLite:', user_name);
      const result = await this.databaseService.executeQuery(
        'SELECT * FROM usuarios WHERE user_name = ?',
        [user_name]
      );
      const existe = result.rows.length > 0;
      console.log('Usuario existe:', existe);
      return existe;
    } catch (error) {
      console.error('Error validando usuario:', error);
      return false;
    }
  }

  async validarCredenciales(user_name: string, password: string): Promise<boolean> {
    console.log('Validando credenciales:', user_name);
    
    if (this.isWeb) {
      console.log('Web: Validando en Storage');
      await this.cargarUsuariosWeb();
      const user = this.usuarios.find(u => u.user_name === user_name && u.password === password);
      const valido = !!user;
      console.log('Web: Credenciales válidas:', valido);
      return valido;
    }

    try {
      console.log('Android: Validando en SQLite');
      const result = await this.databaseService.executeQuery(
        'SELECT * FROM usuarios WHERE user_name = ? AND password = ?',
        [user_name, password]
      );
      const valido = result.rows.length > 0;
      console.log('Android: Credenciales válidas:', valido);
      return valido;
    } catch (error) {
      console.error('Error validando credenciales:', error);
      return false;
    }
  }

  async registrarUsuario(usuario: any): Promise<boolean> {
    console.log('REGISTRO - Iniciando:', usuario.user_name);
    console.log('REGISTRO - isWeb:', this.isWeb);
    
    if (this.isWeb) {
      console.log('REGISTRO - Usando Storage (web)');
      await this.cargarUsuariosWeb();
      
      const existe = this.usuarios.some(u => u.user_name === usuario.user_name);
      if (existe) {
        await this.presentToast('El usuario ya existe');
        console.log('REGISTRO - Usuario ya existe en web');
        return false;
      }

      this.usuarios.forEach(u => u.active = 0);

      const newUser = {
        id: Date.now(),
        user_name: usuario.user_name,
        password: usuario.password,
        nombre: usuario.nombre || usuario.user_name,
        email: usuario.email || usuario.user_name,
        rol: usuario.rol || 'enfermera',
        active: 1
      };
      this.usuarios.push(newUser);
      this.usuarioActual = newUser;
      
      await this.guardarUsuariosWeb();
      await this.presentToast('Usuario registrado correctamente');
      console.log('REGISTRO - Usuario registrado en web:', newUser);
      return true;
    }

    try {
      console.log('REGISTRO - Usando SQLite (Android)');
      
      const existe = await this.validarUsuario(usuario.user_name);
      console.log('REGISTRO - Usuario existe?', existe);
      
      if (existe) {
        await this.presentToast('El usuario ya existe');
        return false;
      }

      console.log('REGISTRO - Desactivando todos los usuarios...');
      await this.databaseService.executeNonQuery(
        'UPDATE usuarios SET active = 0',
        []
      );
      console.log('REGISTRO - Usuarios desactivados');

      console.log('REGISTRO - Insertando usuario...');
      const result = await this.databaseService.executeNonQuery(
        `INSERT INTO usuarios (user_name, password, nombre, email, rol, active)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [
          usuario.user_name,
          usuario.password,
          usuario.nombre || usuario.user_name,
          usuario.email || usuario.user_name,
          usuario.rol || 'enfermera'
        ]
      );
      
      console.log('REGISTRO - Resultado inserción:', result);
      console.log('REGISTRO - Insert ID:', result.insertId);

      await this.cargarUsuarios();
      console.log('REGISTRO - Usuarios recargados:', this.usuarios.length);
      
      await this.presentToast('Usuario registrado correctamente');
      console.log('REGISTRO - Usuario registrado en SQLite');
      return true;
      
    } catch (error) {
      console.error('REGISTRO - Error registrando usuario:', error);
      await this.presentToast('Error al registrar usuario');
      return false;
    }
  }

  async activarSesion(user_name: string): Promise<boolean> {
    console.log('ACTIVAR SESIÓN:', user_name);
    
    if (this.isWeb) {
      console.log('Web: Activando en Storage');
      await this.cargarUsuariosWeb();
      this.usuarios.forEach(u => u.active = 0);
      const user = this.usuarios.find(u => u.user_name === user_name);
      if (user) {
        user.active = 1;
        this.usuarioActual = user;
        await this.guardarUsuariosWeb();
        console.log('Web: Sesión activada');
        return true;
      }
      console.log('Web: Usuario no encontrado');
      return false;
    }

    try {
      console.log('Android: Activando en SQLite');
      
      // Desactivar todos los usuarios
      await this.databaseService.executeNonQuery(
        'UPDATE usuarios SET active = 0',
        []
      );
      console.log('Android: Usuarios desactivados');
      
      // Activar el usuario específico
      const result = await this.databaseService.executeNonQuery(
        'UPDATE usuarios SET active = 1 WHERE user_name = ?',
        [user_name]
      );

      console.log('Android: Resultado completo:', JSON.stringify(result));
           
      const filasAfectadas = result.changes?.changes || 0;
      console.log('Android: Filas afectadas:', filasAfectadas);

      if (filasAfectadas > 0) {
        await this.cargarUsuarios();
        console.log('Android: Sesión activada correctamente');
        return true;
      }
      console.log('Android: No se activó la sesión - 0 filas afectadas');
      return false;
      
    } catch (error) {
      console.error('Error activando sesión:', error);
      return false;
    }
  }

  async cerrarSesion(): Promise<boolean> {
    if (this.isWeb) {
      await this.cargarUsuariosWeb();
      this.usuarios.forEach(u => u.active = 0);
      this.usuarioActual = null;
      await this.guardarUsuariosWeb();
      await this.presentToast('Sesión cerrada correctamente');
      return true;
    }

    try {
      await this.databaseService.executeNonQuery(
        'UPDATE usuarios SET active = 0',
        []
      );
      await this.cargarUsuarios();
      await this.presentToast('Sesión cerrada correctamente');
      return true;
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      return false;
    }
  }

  async obtenerNombreUsuario(user_name: string): Promise<string> {
    if (this.isWeb) {
      await this.cargarUsuariosWeb();
      const user = this.usuarios.find(u => u.user_name === user_name);
      return user?.nombre || user_name || 'Usuario';
    }

    try {
      const result = await this.databaseService.executeQuery(
        'SELECT nombre FROM usuarios WHERE user_name = ?',
        [user_name]
      );
      
      if (result.rows.length > 0) {
        return result.rows.item(0).nombre || user_name;
      }
      return user_name || 'Usuario';
    } catch (error) {
      console.error('Error obteniendo nombre:', error);
      return 'Usuario';
    }
  }

  async guardarExperienciaLaboral(experiencia: any, user_name: string): Promise<boolean> {
    if (this.isWeb) {
      console.log('Web: Guardando experiencia en Storage');
      const key = `experiencias_${user_name}`;
      const experiencias = await this.storage.get(key) || [];
      experiencias.push({
        id: Date.now(),
        ...experiencia
      });
      await this.storage.set(key, experiencias);
      return true;
    }

    try {
      const userResult = await this.databaseService.executeQuery(
        'SELECT id FROM usuarios WHERE user_name = ?',
        [user_name]
      );

      if (userResult.rows.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      const userId = userResult.rows.item(0).id;

      await this.databaseService.executeNonQuery(
        `INSERT INTO experiencias_laborales 
         (user_id, empresa, cargo, ano_inicio, ano_termino, trabajando_actual)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId,
          experiencia.empresa,
          experiencia.cargo,
          experiencia.anoInicio,
          experiencia.trabajandoActual ? null : experiencia.anoTermino,
          experiencia.trabajandoActual ? 1 : 0
        ]
      );

      return true;
    } catch (error) {
      console.error('Error guardando experiencia:', error);
      return false;
    }
  }

  async obtenerExperienciasLaborales(user_name: string): Promise<any[]> {
    if (this.isWeb) {
      console.log('Web: Obteniendo experiencias de Storage');
      const key = `experiencias_${user_name}`;
      const experiencias = await this.storage.get(key) || [];
      return experiencias;
    }

    try {
      const userResult = await this.databaseService.executeQuery(
        'SELECT id FROM usuarios WHERE user_name = ?',
        [user_name]
      );

      if (userResult.rows.length === 0) {
        return [];
      }

      const userId = userResult.rows.item(0).id;

      const result = await this.databaseService.executeQuery(
        `SELECT * FROM experiencias_laborales WHERE user_id = ? ORDER BY ano_inicio DESC`,
        [userId]
      );

      const experiencias = [];
      for (let i = 0; i < result.rows.length; i++) {
        const row = result.rows.item(i);
        experiencias.push({
          id: row.id,
          empresa: row.empresa,
          cargo: row.cargo,
          anoInicio: row.ano_inicio,
          anoTermino: row.ano_termino,
          trabajandoActual: row.trabajando_actual === 1
        });
      }

      return experiencias;
    } catch (error) {
      console.error('Error obteniendo experiencias:', error);
      return [];
    }
  }

  async eliminarExperienciaLaboral(id: number): Promise<boolean> {
    if (this.isWeb) {
      console.log('Web: Eliminando experiencia de Storage');
      return true;
    }

    try {
      await this.databaseService.executeNonQuery(
        'DELETE FROM experiencias_laborales WHERE id = ?',
        [id]
      );
      return true;
    } catch (error) {
      console.error('Error eliminando experiencia:', error);
      return false;
    }
  }

  async guardarCertificacion(certificacion: any, user_name: string): Promise<boolean> {
    if (this.isWeb) {
      console.log('Web: Guardando certificación en Storage');
      const key = `certificaciones_${user_name}`;
      const certificaciones = await this.storage.get(key) || [];
      certificaciones.push({
        id: Date.now(),
        ...certificacion
      });
      await this.storage.set(key, certificaciones);
      return true;
    }

    try {
      const userResult = await this.databaseService.executeQuery(
        'SELECT id FROM usuarios WHERE user_name = ?',
        [user_name]
      );

      if (userResult.rows.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      const userId = userResult.rows.item(0).id;

      await this.databaseService.executeNonQuery(
        `INSERT INTO certificaciones 
         (user_id, nombre, fecha_obtencion, tiene_vencimiento, fecha_vencimiento)
         VALUES (?, ?, ?, ?, ?)`,
        [
          userId,
          certificacion.nombre,
          certificacion.fechaObtencion,
          certificacion.tieneVencimiento ? 1 : 0,
          certificacion.fechaVencimiento || null
        ]
      );

      return true;
    } catch (error) {
      console.error('Error guardando certificación:', error);
      return false;
    }
  }

  async obtenerCertificaciones(user_name: string): Promise<any[]> {
    if (this.isWeb) {
      console.log('Web: Obteniendo certificaciones de Storage');
      const key = `certificaciones_${user_name}`;
      const certificaciones = await this.storage.get(key) || [];
      return certificaciones;
    }

    try {
      const userResult = await this.databaseService.executeQuery(
        'SELECT id FROM usuarios WHERE user_name = ?',
        [user_name]
      );

      if (userResult.rows.length === 0) {
        return [];
      }

      const userId = userResult.rows.item(0).id;

      const result = await this.databaseService.executeQuery(
        `SELECT * FROM certificaciones WHERE user_id = ? ORDER BY fecha_obtencion DESC`,
        [userId]
      );

      const certificaciones = [];
      for (let i = 0; i < result.rows.length; i++) {
        const row = result.rows.item(i);
        certificaciones.push({
          id: row.id,
          nombre: row.nombre,
          fechaObtencion: row.fecha_obtencion,
          tieneVencimiento: row.tiene_vencimiento === 1,
          fechaVencimiento: row.fecha_vencimiento
        });
      }

      return certificaciones;
    } catch (error) {
      console.error('Error obteniendo certificaciones:', error);
      return [];
    }
  }

  async eliminarCertificacion(id: number): Promise<boolean> {
    if (this.isWeb) {
      console.log('Web: Eliminando certificación de Storage');
      return true;
    }

    try {
      await this.databaseService.executeNonQuery(
        'DELETE FROM certificaciones WHERE id = ?',
        [id]
      );
      return true;
    } catch (error) {
      console.error('Error eliminando certificación:', error);
      return false;
    }
  }

  async presentToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
}