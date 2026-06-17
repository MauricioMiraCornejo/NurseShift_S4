import { Component, OnInit } from '@angular/core';

export interface Experiencia {
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

  constructor() {
    // Genera años desde 1980 hasta el próximo año
    const yearActual = new Date().getFullYear();
    for (let i = yearActual + 1; i >= 1980; i--) {
      this.anios.push(i);
    }
  }

  ngOnInit() {
    this.cargarExperiencias();
  }

  cargarExperiencias() {
    const saved = localStorage.getItem('experiencias_laborales');
    if (saved) {
      this.experiencias = JSON.parse(saved);
    }
  }

  guardarExperiencias() {
    localStorage.setItem('experiencias_laborales', JSON.stringify(this.experiencias));
  }

  agregarExperiencia() {
    if (this.nuevaExperiencia.empresa && this.nuevaExperiencia.cargo && this.nuevaExperiencia.anoInicio) {
      const experienciaCopy = { ...this.nuevaExperiencia };
      if (experienciaCopy.trabajandoActual) {
        delete experienciaCopy.anoTermino;
      }
      this.experiencias.push(experienciaCopy);
      this.guardarExperiencias();
      this.nuevaExperiencia = {
        empresa: '',
        anoInicio: new Date().getFullYear(),
        trabajandoActual: false,
        cargo: ''
      };
      this.mostrarFormulario = false;
    }
  }

  eliminarExperiencia(index: number) {
    this.experiencias.splice(index, 1);
    this.guardarExperiencias();
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
  }
}