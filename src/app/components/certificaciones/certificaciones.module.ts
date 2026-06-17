import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // <--- Agregar RouterModule
import { CertificacionesComponent } from './certificaciones.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule 
  ],
  declarations: [CertificacionesComponent],
  exports: [CertificacionesComponent]
})
export class CertificacionesComponentModule {}