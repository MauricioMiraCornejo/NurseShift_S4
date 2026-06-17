import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisTurnosPage } from './mis-turnos.page';

describe('MisTurnosPage', () => {
  let component: MisTurnosPage;
  let fixture: ComponentFixture<MisTurnosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MisTurnosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
