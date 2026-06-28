import { Component, OnInit } from '@angular/core';
import { DbtaskService } from '../../services/dbtask.service';

export interface Experiencia {
  id?: number;
  empresa: string;
  anoInicio: number;
  trabajandoActual: boolean;
  anoTermino?: number;
  cargo: string;
}

@Component({
  selector: 'app-experiencia-laboral',
  templateUrl: './experiencia-laboral.component.html',
  styleUrls: ['./experiencia-laboral.component.scss'],
  standalone: false,
})
export class ExperienciaLaboralComponent implements OnInit {
  experiencias: Experiencia[] = [];
  nuevaExperiencia: Experiencia = {
    empresa: '',
    anoInicio: new Date().getFullYear(),
    trabajandoActual: false,
    cargo: ''
  };
  mostrarFormulario: boolean = false;
  anios: number[] = [];
  usuarioActual: string = '';

  constructor(private dbtaskService: DbtaskService) {
    const yearActual = new Date().getFullYear();
    for (let i = yearActual + 1; i >= 1980; i--) {
      this.anios.push(i);
    }
  }

  async ngOnInit() {
    await this.cargarUsuarioActual();
    await this.cargarExperiencias();
  }

  async cargarUsuarioActual() {
    const sesion = await this.dbtaskService.obtenerSesionActiva();
    if (sesion) {
      this.usuarioActual = sesion.user_name;
    }
  }

  async cargarExperiencias() {
    if (!this.usuarioActual) {
      await this.cargarUsuarioActual();
    }
    
    if (this.usuarioActual) {
      this.experiencias = await this.dbtaskService.obtenerExperienciasLaborales(this.usuarioActual);
    }
  }

  async agregarExperiencia() {
    if (this.nuevaExperiencia.empresa && this.nuevaExperiencia.cargo && this.nuevaExperiencia.anoInicio) {
      
      if (this.nuevaExperiencia.trabajandoActual) {
        delete this.nuevaExperiencia.anoTermino;
      }

      const success = await this.dbtaskService.guardarExperienciaLaboral(
        this.nuevaExperiencia,
        this.usuarioActual
      );

      if (success) {
        await this.cargarExperiencias();
        this.nuevaExperiencia = {
          empresa: '',
          anoInicio: new Date().getFullYear(),
          trabajandoActual: false,
          cargo: ''
        };
        this.mostrarFormulario = false;
        await this.dbtaskService.presentToast('Experiencia agregada correctamente');
      } else {
        await this.dbtaskService.presentToast('Error al agregar experiencia');
      }
    } else {
      await this.dbtaskService.presentToast('Complete todos los campos');
    }
  }

  async eliminarExperiencia(index: number) {
    const experiencia = this.experiencias[index];
    if (experiencia.id) {
      const success = await this.dbtaskService.eliminarExperienciaLaboral(experiencia.id);
      if (success) {
        await this.cargarExperiencias();
        await this.dbtaskService.presentToast('Experiencia eliminada');
      }
    }
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
  }
}