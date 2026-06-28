import { Component, OnInit } from '@angular/core';
import { DbtaskService } from '../../services/dbtask.service';

export interface Certificacion {
  id?: number;
  nombre: string;
  fechaObtencion: string;
  tieneVencimiento: boolean;
  fechaVencimiento?: string;
}

@Component({
  selector: 'app-certificaciones',
  templateUrl: './certificaciones.component.html',
  styleUrls: ['./certificaciones.component.scss'],
  standalone: false,
})
export class CertificacionesComponent implements OnInit {
  certificaciones: Certificacion[] = [];
  nuevaCertificacion: Certificacion = {
    nombre: '',
    fechaObtencion: new Date().toISOString(),
    tieneVencimiento: false
  };
  mostrarFormulario: boolean = false;
  usuarioActual: string = '';

  constructor(private dbtaskService: DbtaskService) { }

  async ngOnInit() {
    await this.cargarUsuarioActual();
    await this.cargarCertificaciones();
  }

  async cargarUsuarioActual() {
    const sesion = await this.dbtaskService.obtenerSesionActiva();
    if (sesion) {
      this.usuarioActual = sesion.user_name;
    }
  }

  async cargarCertificaciones() {
    if (!this.usuarioActual) {
      await this.cargarUsuarioActual();
    }
    
    if (this.usuarioActual) {
      this.certificaciones = await this.dbtaskService.obtenerCertificaciones(this.usuarioActual);
    }
  }

  async agregarCertificacion() {
    if (!this.nuevaCertificacion.nombre || this.nuevaCertificacion.nombre.trim() === '') {
      await this.dbtaskService.presentToast('⚠️ Ingrese el nombre de la certificación');
      return;
    }

    if (!this.nuevaCertificacion.fechaObtencion) {
      await this.dbtaskService.presentToast('⚠️ Seleccione la fecha de obtención');
      return;
    }

    if (this.nuevaCertificacion.tieneVencimiento && !this.nuevaCertificacion.fechaVencimiento) {
      await this.dbtaskService.presentToast('⚠️ Seleccione la fecha de vencimiento');
      return;
    }

    const success = await this.dbtaskService.guardarCertificacion(
      this.nuevaCertificacion,
      this.usuarioActual
    );

    if (success) {
      await this.cargarCertificaciones();
      this.nuevaCertificacion = {
        nombre: '',
        fechaObtencion: new Date().toISOString(),
        tieneVencimiento: false
      };
      this.mostrarFormulario = false;
      await this.dbtaskService.presentToast('✅ Certificación agregada correctamente');
    } else {
      await this.dbtaskService.presentToast('❌ Error al agregar certificación');
    }
  }

  async eliminarCertificacion(index: number) {
    const certificacion = this.certificaciones[index];
    if (certificacion.id) {
      const success = await this.dbtaskService.eliminarCertificacion(certificacion.id);
      if (success) {
        await this.cargarCertificaciones();
        await this.dbtaskService.presentToast('🗑️ Certificación eliminada');
      }
    }
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    try {
      return new Date(fecha).toLocaleDateString('es-CL');
    } catch (e) {
      return fecha;
    }
  }

  estaVencido(fechaVencimiento: string): boolean {
    if (!fechaVencimiento) return false;
    try {
      return new Date(fechaVencimiento) < new Date();
    } catch (e) {
      return false;
    }
  }

  estaProximoAVencer(fechaVencimiento: string): boolean {
    if (!fechaVencimiento) return false;
    try {
      const hoy = new Date();
      const vencimiento = new Date(fechaVencimiento);
      const diffTime = vencimiento.getTime() - hoy.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays > 0 && diffDays <= 30;
    } catch (e) {
      return false;
    }
  }

  getColorCertificado(cert: Certificacion): string {
    if (!cert.tieneVencimiento || !cert.fechaVencimiento) {
      return 'success';
    }
    if (this.estaVencido(cert.fechaVencimiento)) {
      return 'danger';
    }
    if (this.estaProximoAVencer(cert.fechaVencimiento)) {
      return 'warning';
    }
    return 'success';
  }

  getEstadoCertificado(cert: Certificacion): string {
    if (!cert.tieneVencimiento || !cert.fechaVencimiento) {
      return 'Vigente';
    }
    if (this.estaVencido(cert.fechaVencimiento)) {
      return 'VENCIDO';
    }
    if (this.estaProximoAVencer(cert.fechaVencimiento)) {
      return 'Próximo a vencer';
    }
    return 'Vigente';
  }
}