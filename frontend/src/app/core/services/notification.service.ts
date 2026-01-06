import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin, of, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

export interface AppNotification {
  id: string;
  type: 'low_stock' | 'high_churn' | 'sales_anomaly' | 'new_review' | 'system';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly API_URL = 'http://localhost:8080';
  private readonly ANALYTICS_URL = 'http://localhost:8080/api/v1/analytics';
  
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    // Initial load
    this.refreshNotifications();
    
    // Auto-refresh every 5 minutes
    timer(0, 300000).subscribe(() => this.refreshNotifications());
  }

  refreshNotifications(): void {
    this.generateNotifications().subscribe(notifications => {
      this.notificationsSubject.next(notifications);
      this.unreadCountSubject.next(notifications.filter(n => !n.read).length);
    });
  }

  private generateNotifications(): Observable<AppNotification[]> {
    return forkJoin({
      products: this.http.get<any[]>(`${this.API_URL}/products/getAll`).pipe(catchError(() => of([]))),
      sales: this.http.get<any[]>(`${this.API_URL}/sales/getsales`).pipe(catchError(() => of([]))),
      users: this.http.get(`${this.API_URL}/api/csv/users/export`, { responseType: 'text' }).pipe(
        map(csv => this.parseCsvToUsers(csv)),
        catchError(() => of([]))
      ),
    }).pipe(
      map(({ products, sales, users }) => {
        const notifications: AppNotification[] = [];
        const now = new Date();

        // 1. Low Stock Alerts (quantity < 10)
        const lowStockProducts = products.filter(p => p.stockQuantity !== undefined && p.stockQuantity < 10);
        lowStockProducts.forEach(product => {
          const severity = product.stockQuantity <= 0 ? 'critical' : product.stockQuantity < 5 ? 'warning' : 'info';
          notifications.push({
            id: `stock-${product.id}`,
            type: 'low_stock',
            severity,
            title: product.stockQuantity <= 0 ? '🚨 Out of Stock!' : '📦 Low Stock Alert',
            message: `${product.name || product.productName} has only ${product.stockQuantity} units left`,
            timestamp: now,
            read: false,
            actionUrl: '/analytics/products',
            data: { productId: product.id, stock: product.stockQuantity }
          });
        });

        // 2. Churn Risk Alerts - Calculate based on user activity
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const inactiveUsers = users.filter(user => {
          // Check if user has any sales in the last 30 days
          const userSales = sales.filter(s => s.userId === user.id);
          if (userSales.length === 0) return true;
          const lastSaleDate = new Date(Math.max(...userSales.map(s => new Date(s.dateOfSale).getTime())));
          return lastSaleDate < thirtyDaysAgo;
        });
        
        if (inactiveUsers.length > 0) {
          const churnRate = users.length > 0 ? (inactiveUsers.length / users.length) * 100 : 0;
          if (churnRate > 20) {
            notifications.push({
              id: `churn-alert-${Date.now()}`,
              type: 'high_churn',
              severity: churnRate > 50 ? 'critical' : 'warning',
              title: '⚠️ High Churn Risk',
              message: `${inactiveUsers.length} customers (${churnRate.toFixed(1)}%) haven't purchased in 30+ days`,
              timestamp: now,
              read: false,
              actionUrl: '/analytics/users',
              data: { inactiveCount: inactiveUsers.length, churnRate }
            });
          }
        }

        // 3. Sales Anomaly Alerts - Check for unusual sales patterns
        const completedSales = sales.filter(s => s.status === 'COMPLETED');
        if (completedSales.length > 0) {
          // Group by day
          const salesByDay = new Map<string, number>();
          completedSales.forEach(sale => {
            const day = new Date(sale.dateOfSale).toISOString().split('T')[0];
            salesByDay.set(day, (salesByDay.get(day) || 0) + (sale.totalAmount || 0));
          });
          
          const dailyAmounts = Array.from(salesByDay.values());
          const avgDaily = dailyAmounts.reduce((a, b) => a + b, 0) / dailyAmounts.length;
          const stdDev = Math.sqrt(dailyAmounts.map(x => Math.pow(x - avgDaily, 2)).reduce((a, b) => a + b, 0) / dailyAmounts.length);
          
          // Check if any recent day is anomalous (>2 std deviations)
          const last7Days = Array.from(salesByDay.entries())
            .sort((a, b) => b[0].localeCompare(a[0]))
            .slice(0, 7);
          
          last7Days.forEach(([day, amount]) => {
            if (Math.abs(amount - avgDaily) > 2 * stdDev && stdDev > 0) {
              const isHigh = amount > avgDaily;
              notifications.push({
                id: `anomaly-${day}`,
                type: 'sales_anomaly',
                severity: 'info',
                title: isHigh ? '📈 Sales Spike Detected' : '📉 Sales Dip Detected',
                message: `${day}: $${amount.toFixed(0)} (avg: $${avgDaily.toFixed(0)})`,
                timestamp: new Date(day),
                read: false,
                actionUrl: '/analytics/sales',
                data: { day, amount, average: avgDaily }
              });
            }
          });
        }

        // 4. Cancelled/Refunded Orders Alert
        const cancelledSales = sales.filter(s => s.status === 'CANCELLED' || s.status === 'REFUNDED');
        if (cancelledSales.length > 0) {
          const cancelRate = (cancelledSales.length / sales.length) * 100;
          if (cancelRate > 10) {
            notifications.push({
              id: `cancel-rate-${Date.now()}`,
              type: 'system',
              severity: cancelRate > 25 ? 'critical' : 'warning',
              title: '⚠️ High Cancellation Rate',
              message: `${cancelledSales.length} orders (${cancelRate.toFixed(1)}%) cancelled or refunded`,
              timestamp: now,
              read: false,
              actionUrl: '/analytics/sales',
              data: { cancelledCount: cancelledSales.length, cancelRate }
            });
          }
        }

        // Sort by severity and timestamp
        const severityOrder = { critical: 0, warning: 1, info: 2 };
        return notifications.sort((a, b) => {
          const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
          if (severityDiff !== 0) return severityDiff;
          return b.timestamp.getTime() - a.timestamp.getTime();
        });
      })
    );
  }

  markAsRead(notificationId: string): void {
    const current = this.notificationsSubject.value;
    const updated = current.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(updated);
    this.unreadCountSubject.next(updated.filter(n => !n.read).length);
  }

  markAllAsRead(): void {
    const current = this.notificationsSubject.value;
    const updated = current.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(updated);
    this.unreadCountSubject.next(0);
  }

  clearAll(): void {
    this.notificationsSubject.next([]);
    this.unreadCountSubject.next(0);
  }

  getNotifications(): AppNotification[] {
    return this.notificationsSubject.value;
  }

  getUnreadCount(): number {
    return this.unreadCountSubject.value;
  }

  private parseCsvToUsers(csv: string): any[] {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    const users: any[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const user: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index]?.trim() || '';
        switch (header) {
          case 'ID': user.id = parseInt(value) || 0; break;
          case 'USERNAME': user.username = value; break;
          case 'FIRST_NAME': user.firstName = value; break;
          case 'LAST_NAME': user.lastName = value; break;
          case 'EMAIL': user.email = value; break;
          case 'ROLE': user.role = value; break;
        }
      });
      
      if (user.id) users.push(user);
    }
    
    return users;
  }
}