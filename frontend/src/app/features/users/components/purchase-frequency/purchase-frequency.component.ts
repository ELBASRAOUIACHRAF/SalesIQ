import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PurchaseFrequencyAnalysisDto {
  userId: number;
  username: string;
  totalSales: number;
  averageSalesPerMonth: number;
}

@Component({
  selector: 'app-purchase-frequency',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './purchase-frequency.component.html',
  styleUrls: ['./purchase-frequency.component.css']
})
export class PurchaseFrequencyComponent {
  @Input() data: PurchaseFrequencyAnalysisDto[] = [];
  @Input() highFreqThreshold = 5; // avg sales/month
  @Input() lowFreqThreshold = 1;  // avg sales/month

  filterText = signal('');
  sortBy = signal<'avg' | 'total' | 'name'>('avg');

  readonly filteredSorted = computed(() => {
    const term = this.filterText().trim().toLowerCase();
    const filtered = term
      ? this.data.filter(d => d.username.toLowerCase().includes(term))
      : this.data.slice();

    return filtered.sort((a, b) => {
      const sort = this.sortBy();
      if (sort === 'avg') return b.averageSalesPerMonth - a.averageSalesPerMonth;
      if (sort === 'total') return b.totalSales - a.totalSales;
      return a.username.localeCompare(b.username);
    });
  });

  readonly summary = computed(() => {
    const total = this.data.length;
    const high = this.data.filter(d => d.averageSalesPerMonth > this.highFreqThreshold).length;
    const low = this.data.filter(d => d.averageSalesPerMonth <= this.lowFreqThreshold).length;
    const top = this.data.reduce<PurchaseFrequencyAnalysisDto | null>((acc, cur) => {
      if (!acc) return cur;
      return cur.totalSales > acc.totalSales ? cur : acc;
    }, null);
    const maxAvg = this.data.reduce((m, d) => Math.max(m, d.averageSalesPerMonth), 0);
    return { total, high, low, top, maxAvg };
  });

  setFilter(val: string) {
    this.filterText.set(val);
  }

  setSort(val: 'avg' | 'total' | 'name') {
    this.sortBy.set(val);
  }

  barWidth(avg: number): string {
    const max = this.summary().maxAvg || 1;
    const pct = Math.min(100, (avg / max) * 100);
    return pct.toFixed(1) + '%';
  }

  badgeClass(avg: number): string {
    if (avg > this.highFreqThreshold) return 'pill high';
    if (avg <= this.lowFreqThreshold) return 'pill low';
    return 'pill mid';
  }
}
