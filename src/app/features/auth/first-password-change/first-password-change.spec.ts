import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstPasswordChange } from './first-password-change';

describe('FirstPasswordChange', () => {
  let component: FirstPasswordChange;
  let fixture: ComponentFixture<FirstPasswordChange>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FirstPasswordChange],
    }).compileComponents();

    fixture = TestBed.createComponent(FirstPasswordChange);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
