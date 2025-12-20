import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BigKpiCard } from './big-kpi-card';

describe('BigKpiCard', () => {
  let component: BigKpiCard;
  let fixture: ComponentFixture<BigKpiCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BigKpiCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BigKpiCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
