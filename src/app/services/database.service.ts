import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private db!: SQLiteDBConnection;
  private isReady: boolean = false;
  private sqlite: SQLiteConnection;
  private isWeb: boolean = false;
  private storage: Storage | null = null;

  constructor(
    private platform: Platform,
    private storageService: Storage
  ) {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
    // **** Detectar si estamos en web *****
    this.isWeb = !this.platform.is('android') && !this.platform.is('ios');
    console.log('isWeb:', this.isWeb);
    this.initDatabase();
  }

  async initDatabase() {
    await this.platform.ready();

    try {
      // **** Si estamos en web usar Storage en lugar de SQLite *****
      if (this.isWeb) {
        console.log('Usando Storage para Web (SQLite no disponible)');
        this.storage = await this.storageService.create();
        this.isReady = true;
        console.log('Storage inicializado para web');
        return;
      }

      console.log('Inicializando base de datos con Capacitor SQLite...');
      console.log('Platform:', this.platform.platforms());
      console.log('isWeb:', this.isWeb);
      console.log('CapacitorSQLite disponible:', !!CapacitorSQLite);
      
      this.db = await this.sqlite.createConnection(
        'nurseshift_db',
        false,
        'no-encryption',
        1,
        false
      );

      console.log('Conexión creada:', this.db ? 'Sí' : 'No');

      await this.db.open();
      console.log('Base de datos abierta');

      await this.createTables();
      console.log('Tablas creadas correctamente');
            
      try {
        const result = await this.db.query('SELECT name FROM sqlite_master WHERE type="table"');
        console.log('Tablas existentes:', result.values);
      } catch (e) {
        console.log('No se pudieron listar las tablas:', e);
      }
      
      this.isReady = true;
      console.log('Base de datos SQLite (Capacitor) inicializada correctamente');
      
    } catch (error) {
      console.error('Error al inicializar SQLite:', error);
      console.error('Detalles:', JSON.stringify(error));
      await this.recuperarConexion();
    }
  }

  private async recuperarConexion() {
    // **** Si es web usar Storage *****
    if (this.isWeb) {
      console.log('Usando Storage para web');
      this.storage = await this.storageService.create();
      this.isReady = true;
      return;
    }

    try {
      console.log('Intentando recuperar conexión...');
      this.db = await this.sqlite.createConnection(
        'nurseshift_db_backup',
        false,
        'no-encryption',
        1,
        false
      );
      await this.db.open();
      await this.createTables();
      this.isReady = true;
      console.log('Base de datos recuperada correctamente');
    } catch (error) {
      console.error('Error en recuperación:', error);
      // **** Si falla SQLite usar Storage como fallback ****
      console.log('Usando Storage como fallback');
      this.storage = await this.storageService.create();
      this.isReady = true;
    }
  }

  async createTables() {
    if (this.isWeb) {
      console.log('Web: No se crean tablas, usando Storage');
      return;
    }

    try {
      console.log('Creando tablas en SQLite...');
      
      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS usuarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_name TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          nombre TEXT,
          email TEXT,
          rol TEXT,
          active INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Tabla usuarios creada');

      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS experiencias_laborales (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          empresa TEXT NOT NULL,
          cargo TEXT NOT NULL,
          ano_inicio INTEGER NOT NULL,
          ano_termino INTEGER,
          trabajando_actual INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
        )
      `);
      console.log('Tabla experiencias_laborales creada');

      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS certificaciones (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          nombre TEXT NOT NULL,
          fecha_obtencion TEXT NOT NULL,
          tiene_vencimiento INTEGER DEFAULT 0,
          fecha_vencimiento TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
        )
      `);
      console.log('Tabla certificaciones creada');

      console.log('Todas las tablas creadas exitosamente (Capacitor)');
    } catch (error) {
      console.error('Error al crear tablas:', error);
      throw error;
    }
  }

  async getConnection(): Promise<SQLiteDBConnection | Storage> {
    if (!this.isReady) {
      await this.initDatabase();
    }
    
    if (this.isWeb) {
      return this.storage!;
    }
    return this.db;
  }

  async executeQuery(query: string, params: any[] = []): Promise<any> {

    if (this.isWeb) {
      console.log('Web: Consulta mock:', query);
      const key = this.getStorageKey(query);
      const data = await this.storage?.get(key);
      return {
        rows: {
          length: data ? data.length : 0,
          item: (index: number) => data ? data[index] : null
        }
      };
    }

    try {
      const db = await this.getConnection() as SQLiteDBConnection;
      const result = await db.query(query, params);
      return this.formatearResultado(result);
    } catch (error) {
      console.error('Error en consulta SQL:', error);
      throw error;
    }
  }

  async executeNonQuery(query: string, params: any[] = []): Promise<any> {
    // *** Si es web, guardar en Storage ***
    if (this.isWeb) {
      console.log('Web: Modificación mock:', query);
      const key = this.getStorageKey(query);
      const data = await this.storage?.get(key) || [];
      const newItem = {
        id: Date.now(),
        ...params.reduce((obj: any, val: any, idx: number) => {
          obj[`param${idx}`] = val;
          return obj;
        }, {})
      };
      data.push(newItem);
      await this.storage?.set(key, data);
      return {
        rowsAffected: 1,
        insertId: newItem.id
      };
    }

    try {
      const db = await this.getConnection() as SQLiteDBConnection;
      const result = await db.run(query, params);
            
      console.log('📱 Resultado de db.run():', result);
      
      return {
        changes: result.changes || { changes: 0, lastId: null, values: [] }
      };
      
    } catch (error) {
      console.error('Error en modificación SQL:', error);
      throw error;
    }
  }

  private getStorageKey(query: string): string {
    const match = query.match(/FROM\s+(\w+)/i) || query.match(/INTO\s+(\w+)/i);
    return match ? `db_${match[1]}` : 'db_data';
  }

  private formatearResultado(result: any): any {
    if (!result || !result.values) {
      return { rows: { length: 0, item: () => null } };
    }

    return {
      rows: {
        length: result.values.length,
        item: (index: number) => {
          return result.values[index] || null;
        }
      }
    };
  }

  isDatabaseReady(): boolean {
    return this.isReady;
  }

  async closeConnection(): Promise<void> {
    if (this.isWeb) {
      console.log('Web: No hay conexión que cerrar');
      return;
    }

    try {
      if (this.db) {
        await this.db.close();
        this.isReady = false;
        console.log('Conexión a base de datos cerrada');
      }
    } catch (error) {
      console.error('Error al cerrar conexión:', error);
    }
  }
}