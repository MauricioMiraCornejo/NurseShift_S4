import { Component, OnInit } from '@angular/core';
import { DbtaskService } from '../../services/dbtask.service';

@Component({
  selector: 'app-mis-datos',
  templateUrl: './mis-datos.component.html',
  styleUrls: ['./mis-datos.component.scss'],
  standalone: false,
})
export class MisDatosComponent implements OnInit {
  nombreEnfermera: string = 'Cargando...';
  turnoHoy: any = {
    fecha: this.obtenerFechaActual(),
    horario: '08:00 - 14:00',
    tipo: 'Turno Mañana',
    estado: 'Activo'
  };

  constructor(private dbtaskService: DbtaskService) { }

  async ngOnInit() {
    const sesion = await this.dbtaskService.obtenerSesionActiva();
    if (sesion) {
      const nombre = await this.dbtaskService.obtenerNombreUsuario(sesion.user_name);
      this.nombreEnfermera = nombre || sesion.user_name || 'Usuario';
    }
    
    
    this.actualizarFechaTurno();
  }


  obtenerFechaActual(): string {
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const hoy = new Date();
    const diaSemana = diasSemana[hoy.getDay()];
    const diaNumero = hoy.getDate();
    const mes = meses[hoy.getMonth()];
    const año = hoy.getFullYear();
    
    return `${diaSemana} ${diaNumero} de ${mes}`;
  }


  actualizarFechaTurno() {
    this.turnoHoy.fecha = this.obtenerFechaActual();
  }
}