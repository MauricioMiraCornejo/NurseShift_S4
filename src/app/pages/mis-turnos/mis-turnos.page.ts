import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-mis-turnos',
  templateUrl: './mis-turnos.page.html',
  styleUrls: ['./mis-turnos.page.scss'],
  standalone: false,
  animations: [
    trigger('fadeInList', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class MisTurnosPage implements OnInit {
  turnos = [
    { id: 1, fecha: 'Lunes 10 de Junio', hora: '08:00 - 14:00', tipo: 'Mañana', estado: 'Activo', color: 'success' },
    { id: 2, fecha: 'Martes 11 de Junio', hora: '14:00 - 20:00', tipo: 'Tarde', estado: 'Pendiente', color: 'warning' },
    { id: 3, fecha: 'Miércoles 12 de Junio', hora: '20:00 - 08:00', tipo: 'Noche', estado: 'Pendiente', color: 'warning' },
    { id: 4, fecha: 'Jueves 13 de Junio', hora: '08:00 - 14:00', tipo: 'Mañana', estado: 'Confirmado', color: 'primary' },
    { id: 5, fecha: 'Viernes 14 de Junio', hora: '14:00 - 20:00', tipo: 'Tarde', estado: 'Confirmado', color: 'primary' }
  ];

  constructor() { }

  ngOnInit() { }
}