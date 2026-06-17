import { Component, OnInit } from '@angular/core';

export interface Certificacion {
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

  constructor() { }

  ngOnInit() {
    this.cargarCertificaciones();
  }

  cargarCertificaciones() {
    const saved = localStorage.getItem('certificaciones');
    if (saved) {
      try {
        this.certificaciones = JSON.parse(saved);
      } catch (e) {
        console.error('Error al cargar certificaciones:', e);
        this.certificaciones = [];
      }
    }
  }

  guardarCertificaciones() {
    try {
      localStorage.setItem('certificaciones', JSON.stringify(this.certificaciones));
      console.log('Certificaciones guardadas:', this.certificaciones);
    } catch (e) {
      console.error('Error al guardar certificaciones:', e);
    }
  }

  agregarCertificacion() {
    console.log('Intentando agregar certificación...');
    console.log('Datos:', this.nuevaCertificacion);

    if (!this.nuevaCertificacion.nombre || this.nuevaCertificacion.nombre.trim() === '') {
      console.warn('El nombre es obligatorio');
      alert('Por favor, ingresa el nombre de la certificación');
      return;
    }

    if (!this.nuevaCertificacion.fechaObtencion) {
      console.warn('La fecha de obtención es obligatoria');
      alert('Por favor, selecciona la fecha de obtención');
      return;
    }

    if (this.nuevaCertificacion.tieneVencimiento && !this.nuevaCertificacion.fechaVencimiento) {
      console.warn('La fecha de vencimiento es obligatoria');
      alert('Por favor, selecciona la fecha de vencimiento');
      return;
    }

    const certificacionCopy = { ...this.nuevaCertificacion };
    
    if (!certificacionCopy.tieneVencimiento) {
      delete certificacionCopy.fechaVencimiento;
    }

    this.certificaciones.push(certificacionCopy);
    this.guardarCertificaciones();

    this.nuevaCertificacion = {
      nombre: '',
      fechaObtencion: new Date().toISOString(),
      tieneVencimiento: false
    };
    this.mostrarFormulario = false;

    console.log('✅ Certificación agregada exitosamente');
    alert('✅ Certificación agregada correctamente');
  }

  eliminarCertificacion(index: number) {
    if (confirm('¿Estás seguro de eliminar esta certificación?')) {
      this.certificaciones.splice(index, 1);
      this.guardarCertificaciones();
      console.log('Certificación eliminada');
    }
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
    console.log('Formulario visible:', this.mostrarFormulario);
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

  getColorCertificado(cert: Certificacion): string {
    if (!cert.tieneVencimiento || !cert.fechaVencimiento) {
      return 'success';
    }
    return this.estaVencido(cert.fechaVencimiento) ? 'danger' : 'warning';
  }

  getEstadoCertificado(cert: Certificacion): string {
    if (!cert.tieneVencimiento || !cert.fechaVencimiento) {
      return 'Vigente';
    }
    return this.estaVencido(cert.fechaVencimiento) ? 'VENCIDO' : 'Vigente';
  }
}