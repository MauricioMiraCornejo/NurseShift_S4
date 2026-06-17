import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MisTurnosPage } from './mis-turnos.page';

const routes: Routes = [
  {
    path: '',
    component: MisTurnosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MisTurnosPageRoutingModule {}
