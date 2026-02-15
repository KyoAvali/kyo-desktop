import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainDesktop } from './main-desktop';

describe('MainDesktop', () => {
  let component: MainDesktop;
  let fixture: ComponentFixture<MainDesktop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainDesktop]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainDesktop);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
