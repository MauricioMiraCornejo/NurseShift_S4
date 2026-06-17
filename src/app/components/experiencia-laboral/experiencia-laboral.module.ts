// NURSESHIFT/src/app/components/experiencia-laboral/experiencia-laboral.module.ts (MODIFICADO)
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // <--- Agregar RouterModule
import { ExperienciaLaboralComponent } from './experiencia-laboral.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule 
  ],
  declarations: [ExperienciaLaboralComponent],
  exports: [ExperienciaLaboralComponent]
})
export class ExperienciaLaboralComponentModule {}