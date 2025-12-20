import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KpiBarChartComponent } from './kpi-bar-chart';

describe('KpiBarChart', () => {
  let component: KpiBarChart;
  let fixture: ComponentFixture<KpiBarChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [KpiBarChartComponent] }).compileComponents();
    fixture = TestBed.createComponent(KpiBarChartComponent);
    component = fixture.componentInstance;
  });

  it('renders title and value', async () => {
    component.title = 'Orders';
    component.value = 543;
    fixture.detectChanges();
    await fixture.whenStable();

    const title = fixture.debugElement.query(By.css('.title')).nativeElement.textContent.trim();
    const value = fixture.debugElement.query(By.css('.value')).nativeElement.textContent.trim();
    expect(title).toBe('Orders');
    expect(value).toContain('543');
  });

  it('renders bars for data', async () => {
    component.bars = [1, 3, 2, 4, 5];
    fixture.detectChanges();
    await fixture.whenStable();

    const bars = fixture.debugElement.queryAll(By.css('.bar'));
    expect(bars.length).toBe(5);
  });
});
