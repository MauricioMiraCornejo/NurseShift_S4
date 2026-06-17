import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { DbtaskService } from '../services/dbtask.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private dbtaskService: DbtaskService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    const sesionActiva = await this.dbtaskService.sesionActiva();
    
    if (sesionActiva) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}