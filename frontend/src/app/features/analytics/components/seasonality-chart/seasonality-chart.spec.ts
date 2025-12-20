import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { SeasonalityAnalysisComponent } from './seasonality-chart';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { of } from 'rxjs';

describe('SeasonalityAnalysisComponent', () => {
  let fixture: ComponentFixture<SeasonalityAnalysisComponent>;
  let component: SeasonalityAnalysisComponent;
  const mock = {
    originalSeries: [{ timestamp: '2024-01-01T00:00:00', value: 10 }],
    trendSeries: [{ timestamp: '2024-01-01T00:00:00', value: 9 }],
    seasonalSeries: [{ timestamp: '2024-01-01T00:00:00', value: 1 }],
    residualSeries: [{ timestamp: '2024-01-01T00:00:00', value: 0 }],
    seasonalityType: 'MONTHLY',
    seasonalityStrength: 0.72
  };

  beforeEach(waitForAsync(() => {
    const spy = jasmine.createSpyObj('AnalyticsService', ['analyzeSeasonality']);
    spy.analyzeSeasonality.and.returnValue(of(mock));

    TestBed.configureTestingModule({
      imports: [SeasonalityAnalysisComponent],
      providers: [{ provide: AnalyticsService, useValue: spy }]
    }).compileComponents();

    fixture = TestBed.createComponent(SeasonalityAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('creates', () => expect(component).toBeTruthy());
  it('shows seasonality summary', () => {
    const el = fixture.nativeElement;
    expect(el.querySelector('.seasonality-header').textContent).toContain('Seasonality Analysis');
    expect(el.querySelector('.summary').textContent).toContain('MONTHLY');
  });
});
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeasonalityChart } from './seasonality-chart';

describe('SeasonalityChart', () => {
  let component: SeasonalityChart;
  let fixture: ComponentFixture<SeasonalityChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeasonalityChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeasonalityChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
