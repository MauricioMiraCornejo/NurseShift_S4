import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';
import { HomePage } from './home.page';


import { MisDatosComponentModule } from '../../components/mis-datos/mis-datos.module';
import { ExperienciaLaboralComponentModule } from '../../components/experiencia-laboral/experiencia-laboral.module';
import { CertificacionesComponentModule } from '../../components/certificaciones/certificaciones.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    MisDatosComponentModule,
    ExperienciaLaboralComponentModule,
    CertificacionesComponentModule
  ],
  declarations: [HomePage]
})
export class HomePageModule {}