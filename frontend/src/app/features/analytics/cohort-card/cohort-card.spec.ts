import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CohortCardComponent } from './cohort-card';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';

describe('CohortCardComponent', () => {
  let component: CohortCardComponent;
  let fixture: ComponentFixture<CohortCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CohortCardComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CohortCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders cohort values after service response', () => {
    const httpMock = TestBed.inject(HttpTestingController);
    // trigger ngOnInit
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:8080/api/analytics/cohorts?startDate=2025-01-01T00:00:00&endDate=2025-12-31T23:59:59');
    expect(req.request.method).toBe('GET');

    req.flush({ totalUsers: 200, totalCohorts: 5, activeUsers: 170, avgUsersPerCohort: 40 });
    fixture.detectChanges();

    const totalUsersEl = fixture.debugElement.query(By.css('.kpi .value'));
    expect(totalUsersEl.nativeElement.textContent.trim()).toBe('200');
    httpMock.verify();
  });
});
