import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  nombreEnfermera: string = 'Josefina Mira';
  turnoHoy: any = {
    fecha: 'Lunes 08 de Junio',
    horario: '08:00 - 14:00',
    tipo: 'Turno Mañana',
    estado: 'Activo'
  };
  
  segmentoActual: string = 'mis-datos';

  constructor() {}

  ngOnInit() {}


  cambiarSegmento(event: any) {
    this.segmentoActual = event.detail.value;
    console.log('Segmento cambiado a:', this.segmentoActual);
  }
}