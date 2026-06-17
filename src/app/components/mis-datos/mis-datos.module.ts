import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; 
import { MisDatosComponent } from './mis-datos.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule 
  ],
  declarations: [MisDatosComponent],
  exports: [MisDatosComponent]
})
export class MisDatosComponentModule {}