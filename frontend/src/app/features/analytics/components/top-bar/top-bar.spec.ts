import { TestBed } from '@angular/core/testing';
import { TopBarComponent } from './top-bar';

describe('TopBarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopBarComponent]
    }).compileComponents();
  });

  it('renders title and default tabs', () => {
    const fixture = TestBed.createComponent(TopBarComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.title')?.textContent?.trim()).toBe('Dashboard');
    const tabs = el.querySelectorAll('.tabs li');
    expect(tabs.length).toBeGreaterThan(0);
  });

  it('emits tabChange on click', () => {
    const fixture = TestBed.createComponent(TopBarComponent);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    let selected = '';
    cmp.tabChange.subscribe((v) => (selected = v));
    const el: HTMLElement = fixture.nativeElement;
    const first = el.querySelector('.tabs li');
    first?.dispatchEvent(new Event('click'));
    fixture.detectChanges();
    expect(selected).toBe(cmp.tabs[0]);
  });

  it('shows compact select when compactAt is large (simulates small viewport)', () => {
    const fixture = TestBed.createComponent(TopBarComponent);
    const cmp = fixture.componentInstance;
    cmp.compactAt = 9999; // force compact mode
    cmp.updateCompact();
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.tabs-select')).toBeTruthy();
    const select = el.querySelector('.tabs-select') as HTMLSelectElement;
    select.value = cmp.tabs[1];
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(cmp.activeTab).toBe(cmp.tabs[1]);
  });
});
