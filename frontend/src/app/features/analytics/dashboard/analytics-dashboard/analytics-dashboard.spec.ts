import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { AnalyticsDashboard } from './analytics-dashboard';

describe('AnalyticsDashboard', () => {
	let fixture: ComponentFixture<AnalyticsDashboard>;
	let component: AnalyticsDashboard;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [AnalyticsDashboard]
		}).compileComponents();

		fixture = TestBed.createComponent(AnalyticsDashboard);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('creates', () => {
		expect(component).toBeTruthy();
	});

	it('does not render the fetch products button', () => {
		const btn = fixture.nativeElement.querySelector('.fetch-btn');
		expect(btn).toBeNull();
	});

	it('renders compact profile bars for each chart and bar card', () => {
		const controls = fixture.nativeElement.querySelectorAll('.card-controls');
		// Expect one control for each chart and bar card (2 chart + 2 bar = 4)
		expect(controls.length).toBe(4);
	});

	it('renders seasonality preview', () => {
		const season = fixture.nativeElement.querySelector('app-seasonality-chart');
		expect(season).toBeTruthy();
	});
});

