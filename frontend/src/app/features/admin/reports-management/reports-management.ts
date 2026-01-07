import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  ReportService, 
  UserReportData, 
  ProductReportData, 
  SaleReportData, 
  ReviewReportData,
  ReportSummary 
} from '../../../core/services/report.service';

interface ReportType {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  columns: string[];
  dataKey: 'users' | 'products' | 'sales' | 'reviews';
}

@Component({
  selector: 'app-reports-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, CurrencyPipe],
  templateUrl: './reports-management.html',
  styleUrls: ['./reports-management.css']
})
export class ReportsManagement implements OnInit {
  reportTypes: ReportType[] = [
    {
      id: 'users',
      name: 'Users Report',
      icon: '👥',
      description: 'Complete user data including profiles, roles, activity and location info',
      color: '#6366f1',
      columns: ['ID', 'Username', 'Name', 'Email', 'Phone', 'Role', 'Status', 'City', 'Country', 'Created'],
      dataKey: 'users'
    },
    {
      id: 'products',
      name: 'Products Report',
      icon: '📦',
      description: 'Product catalog with pricing, inventory, ratings and specifications',
      color: '#8b5cf6',
      columns: ['ID', 'Name', 'Brand', 'Price', 'Stock', 'Discount', 'Rating', 'Reviews', 'Dimensions'],
      dataKey: 'products'
    },
    {
      id: 'sales',
      name: 'Sales Report',
      icon: '💰',
      description: 'Transaction history with amounts, payment methods and status',
      color: '#10b981',
      columns: ['ID', 'Date', 'User ID', 'Amount', 'Payment Method', 'Status'],
      dataKey: 'sales'
    },
    {
      id: 'reviews',
      name: 'Reviews Report',
      icon: '⭐',
      description: 'Customer feedback with ratings, comments and product associations',
      color: '#f59e0b',
      columns: ['ID', 'User', 'Product', 'Rating', 'Comment', 'Date'],
      dataKey: 'reviews'
    }
  ];

  // Data stores
  users: UserReportData[] = [];
  products: ProductReportData[] = [];
  sales: SaleReportData[] = [];
  reviews: ReviewReportData[] = [];
  summary: ReportSummary | null = null;

  // State
  loading = false;
  loadingReport: string | null = null;
  generatingPdf: string | null = null;
  previewReport: ReportType | null = null;
  showPreviewModal = false;
  dataLoaded = false;

  // Date filters
  dateFrom: string = '';
  dateTo: string = '';

  constructor(
    private reportService: ReportService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loading = true;
    
    // Load each data source independently to handle partial failures
    let completedRequests = 0;
    const totalRequests = 4;

    const checkComplete = () => {
      completedRequests++;
      if (completedRequests >= totalRequests) {
        this.calculateSummary();
        this.dataLoaded = true;
        this.loading = false;
        this.cdr.detectChanges();
      }
    };

    this.reportService.getUsers().subscribe({
      next: (data) => { this.users = data || []; checkComplete(); },
      error: (err) => { console.error('Failed to load users:', err); this.users = []; checkComplete(); }
    });

    this.reportService.getProducts().subscribe({
      next: (data) => { this.products = data || []; checkComplete(); },
      error: (err) => { console.error('Failed to load products:', err); this.products = []; checkComplete(); }
    });

    this.reportService.getSales().subscribe({
      next: (data) => { this.sales = data || []; checkComplete(); },
      error: (err) => { console.error('Failed to load sales:', err); this.sales = []; checkComplete(); }
    });

    this.reportService.getReviews().subscribe({
      next: (data) => { this.reviews = data || []; checkComplete(); },
      error: (err) => { console.error('Failed to load reviews:', err); this.reviews = []; checkComplete(); }
    });
  }

  private calculateSummary(): void {
    const totalRevenue = this.sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
    const avgRating = this.reviews.length > 0 
      ? this.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / this.reviews.length 
      : 0;

    this.summary = {
      totalUsers: this.users.length,
      activeUsers: this.users.filter(u => u.active).length,
      totalProducts: this.products.length,
      lowStockProducts: this.products.filter(p => (p.stock || 0) < 10).length,
      totalSales: this.sales.length,
      totalRevenue: totalRevenue,
      totalReviews: this.reviews.length,
      averageRating: Math.round(avgRating * 10) / 10,
      generatedAt: new Date().toISOString()
    };
  }

  getDataForReport(reportType: ReportType): any[] {
    switch (reportType.dataKey) {
      case 'users': return this.users;
      case 'products': return this.products;
      case 'sales': return this.sales;
      case 'reviews': return this.reviews;
      default: return [];
    }
  }

  getDataCount(reportType: ReportType): number {
    return this.getDataForReport(reportType).length;
  }

  openPreview(reportType: ReportType): void {
    this.previewReport = reportType;
    this.showPreviewModal = true;
    this.cdr.detectChanges();
  }

  closePreview(): void {
    this.showPreviewModal = false;
    this.previewReport = null;
    this.cdr.detectChanges();
  }

  async generatePdf(reportType: ReportType): Promise<void> {
    this.generatingPdf = reportType.id;
    this.cdr.detectChanges();

    try {
      const data = this.getDataForReport(reportType);
      const doc = this.createPdfDocument(reportType, data);
      
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Download the PDF
      this.downloadPdf(doc, `${reportType.id}-report-${this.formatDateForFile(new Date())}.pdf`);
      
      this.showToast(`${reportType.name} generated successfully!`, 'success');
    } catch (error) {
      console.error('PDF generation error:', error);
      this.showToast('Failed to generate PDF', 'error');
    } finally {
      this.generatingPdf = null;
      this.cdr.detectChanges();
    }
  }

  async generateAllReports(): Promise<void> {
    this.generatingPdf = 'all';
    this.cdr.detectChanges();

    try {
      const doc = this.createComprehensiveReport();
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      this.downloadPdf(doc, `salesiq-complete-report-${this.formatDateForFile(new Date())}.pdf`);
      
      this.showToast('Complete report generated successfully!', 'success');
    } catch (error) {
      console.error('PDF generation error:', error);
      this.showToast('Failed to generate complete report', 'error');
    } finally {
      this.generatingPdf = null;
      this.cdr.detectChanges();
    }
  }

  private createPdfDocument(reportType: ReportType, data: any[]): string {
    const styles = this.getPdfStyles();
    const header = this.createPdfHeader(reportType.name, reportType.icon);
    const summarySection = this.createReportSummarySection(reportType);
    const tableContent = this.createTableContent(reportType, data);
    const footer = this.createPdfFooter();

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${reportType.name} - SalesIQ</title>
        ${styles}
      </head>
      <body>
        ${header}
        <div class="content-wrapper">
          ${summarySection}
          ${tableContent}
        </div>
        ${footer}
      </body>
      </html>
    `;
  }

  private createComprehensiveReport(): string {
    const styles = this.getPdfStyles();
    const header = this.createPdfHeader('Complete Business Report', '📊');
    
    let content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Complete Business Report - SalesIQ</title>
        ${styles}
      </head>
      <body>
        ${header}
        ${this.createExecutiveSummary()}
    `;

    // Add each report section
    for (const reportType of this.reportTypes) {
      const data = this.getDataForReport(reportType);
      content += `
        <div class="section-divider">
          <h2>${reportType.icon} ${reportType.name}</h2>
        </div>
        ${this.createTableContent(reportType, data.slice(0, 50))}
        ${data.length > 50 ? `<p class="more-records">... and ${data.length - 50} more records</p>` : ''}
      `;
    }

    content += `
        ${this.createPdfFooter()}
      </body>
      </html>
    `;

    return content;
  }

  private getPdfStyles(): string {
    return `
      <style>
        @page {
          size: A4 landscape;
          margin: 0;
        }
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 11px;
          line-height: 1.5;
          color: #1e293b;
          background: #ffffff;
          padding: 0;
          margin: 0;
        }
        
        .report-header {
          background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 50%, #1e3a5f 100%);
          color: white;
          padding: 20px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 4px solid #f59e0b;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .logo-box {
          width: 50px;
          height: 50px;
          background: rgba(255,255,255,0.15);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }
        
        .header-title {
          display: flex;
          flex-direction: column;
        }
        
        .report-header h1 {
          font-size: 22px;
          font-weight: 700;
          margin: 0;
          letter-spacing: -0.5px;
        }
        
        .header-subtitle {
          font-size: 11px;
          opacity: 0.85;
          margin-top: 2px;
        }
        
        .report-meta {
          text-align: right;
          font-size: 10px;
          line-height: 1.6;
        }
        
        .report-meta .company {
          font-size: 14px;
          font-weight: 700;
          color: #f59e0b;
          margin-bottom: 2px;
        }
        
        .report-meta div {
          opacity: 0.9;
        }
        
        .content-wrapper {
          padding: 25px 40px;
        }
        
        .summary-cards {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .summary-card {
          flex: 1;
          background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          border-top: 3px solid #3b82f6;
        }
        
        .summary-card:nth-child(2) { border-top-color: #10b981; }
        .summary-card:nth-child(3) { border-top-color: #8b5cf6; }
        .summary-card:nth-child(4) { border-top-color: #f59e0b; }
        
        .summary-card .value {
          font-size: 28px;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 4px;
          line-height: 1.2;
        }
        
        .summary-card .label {
          font-size: 10px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }
        
        .executive-summary {
          background: linear-gradient(145deg, #f0fdf4 0%, #dcfce7 100%);
          border: 1px solid #bbf7d0;
          border-radius: 12px;
          padding: 20px 25px;
          margin-bottom: 25px;
        }
        
        .executive-summary h3 {
          color: #166534;
          margin-bottom: 15px;
          font-size: 14px;
          font-weight: 700;
        }
        
        .exec-grid {
          display: flex;
          justify-content: space-around;
        }
        
        .exec-item {
          text-align: center;
          padding: 0 20px;
        }
        
        .exec-item .number {
          font-size: 32px;
          font-weight: 800;
          color: #15803d;
        }
        
        .exec-item .desc {
          font-size: 10px;
          color: #166534;
          margin-top: 4px;
        }
        
        .section-divider {
          background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 100%);
          padding: 12px 20px;
          margin: 30px 0 20px 0;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
          page-break-before: always;
        }
        
        .section-divider:first-of-type {
          page-break-before: auto;
        }
        
        .section-divider h2 {
          font-size: 15px;
          color: #1e293b;
          font-weight: 700;
          margin: 0;
        }
        
        .table-container {
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          border: 1px solid #e2e8f0;
        }
        
        .table-header {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 12px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .table-title {
          font-weight: 700;
          font-size: 12px;
          color: #1e3a5f;
        }
        
        .record-count {
          background: #1e3a5f;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 600;
        }
        
        table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin: 0;
          border-radius: 0;
          overflow: hidden;
          box-shadow: none;
        }
        
        thead {
          background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
        }
        
        th {
          color: white;
          padding: 12px 12px;
          text-align: left;
          font-weight: 600;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: none;
        }
        
        th:first-child {
          padding-left: 16px;
        }
        
        td {
          padding: 10px 12px;
          border-bottom: 1px solid #e2e8f0;
          color: #334155;
          font-size: 10px;
          vertical-align: middle;
        }
        
        td:first-child {
          padding-left: 16px;
          font-weight: 600;
          color: #64748b;
        }
        
        tbody tr {
          background: #ffffff;
        }
        
        tbody tr:nth-child(even) {
          background: #f8fafc;
        }
        
        tbody tr:last-child td {
          border-bottom: none;
        }
        
        .status-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 8px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        
        .status-active, .status-completed {
          background: #dcfce7;
          color: #166534;
        }
        
        .status-inactive, .status-cancelled, .status-refunded {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }
        
        .rating {
          color: #d97706;
          font-weight: 700;
        }
        
        .currency {
          color: #059669;
          font-weight: 700;
        }
        
        .low-stock {
          color: #dc2626;
          font-weight: 700;
        }
        
        .more-records {
          text-align: center;
          color: #64748b;
          font-style: italic;
          padding: 10px;
          background: #f8fafc;
          border-radius: 6px;
          margin-top: 10px;
        }
        
        .report-footer {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 15px 40px;
          border-top: 2px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 9px;
          color: #64748b;
          margin-top: 30px;
        }
        
        .footer-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .footer-brand strong {
          color: #1e3a5f;
          font-size: 13px;
          font-weight: 700;
        }
        
        .footer-brand span {
          color: #64748b;
          font-size: 10px;
        }
        
        .confidential {
          color: #dc2626;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-size: 9px;
          padding: 5px 14px;
          border: 2px solid #fecaca;
          border-radius: 4px;
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
        }
        
        .footer-right {
          text-align: right;
          font-size: 9px;
          color: #94a3b8;
        }
        
        @media print {
          body { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
          }
          .report-header {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          thead {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .summary-card {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .section-divider { page-break-before: always; }
          .section-divider:first-of-type { page-break-before: auto; }
        }
      </style>
    `;
  }

  private createPdfHeader(title: string, icon: string): string {
    const now = new Date();
    return `
      <div class="report-header">
        <div class="header-left">
          <div class="logo-box">${icon}</div>
          <div class="header-title">
            <h1>${title}</h1>
            <div class="header-subtitle">Business Intelligence Report</div>
          </div>
        </div>
        <div class="report-meta">
          <div class="company">SalesIQ</div>
          <div>Generated: ${this.formatDateTime(now)}</div>
          <div>Report ID: RPT-${Date.now().toString(36).toUpperCase()}</div>
        </div>
      </div>
    `;
  }

  private createReportSummarySection(reportType: ReportType): string {
    const data = this.getDataForReport(reportType);
    let cards = '';

    switch (reportType.dataKey) {
      case 'users':
        const activeUsers = this.users.filter(u => u.active).length;
        const admins = this.users.filter(u => u.role === 'ADMIN').length;
        cards = `
          <div class="summary-card"><div class="value">${data.length}</div><div class="label">Total Users</div></div>
          <div class="summary-card"><div class="value">${activeUsers}</div><div class="label">Active Users</div></div>
          <div class="summary-card"><div class="value">${data.length - activeUsers}</div><div class="label">Inactive Users</div></div>
          <div class="summary-card"><div class="value">${admins}</div><div class="label">Administrators</div></div>
        `;
        break;

      case 'products':
        const avgPrice = data.length > 0 ? this.products.reduce((s, p) => s + p.price, 0) / data.length : 0;
        const lowStock = this.products.filter(p => p.stock < 10).length;
        const totalStock = this.products.reduce((s, p) => s + p.stock, 0);
        cards = `
          <div class="summary-card"><div class="value">${data.length}</div><div class="label">Total Products</div></div>
          <div class="summary-card"><div class="value">$${avgPrice.toFixed(2)}</div><div class="label">Avg. Price</div></div>
          <div class="summary-card"><div class="value">${totalStock.toLocaleString()}</div><div class="label">Total Stock</div></div>
          <div class="summary-card"><div class="value">${lowStock}</div><div class="label">Low Stock Items</div></div>
        `;
        break;

      case 'sales':
        const totalRevenue = this.sales.reduce((s, sale) => s + (sale.totalAmount || 0), 0);
        const completed = this.sales.filter(s => s.status === 'COMPLETED').length;
        const avgOrder = data.length > 0 ? totalRevenue / data.length : 0;
        cards = `
          <div class="summary-card"><div class="value">${data.length}</div><div class="label">Total Orders</div></div>
          <div class="summary-card"><div class="value">$${totalRevenue.toLocaleString()}</div><div class="label">Total Revenue</div></div>
          <div class="summary-card"><div class="value">$${avgOrder.toFixed(2)}</div><div class="label">Avg. Order Value</div></div>
          <div class="summary-card"><div class="value">${completed}</div><div class="label">Completed Orders</div></div>
        `;
        break;

      case 'reviews':
        const avgRating = data.length > 0 ? this.reviews.reduce((s, r) => s + r.rating, 0) / data.length : 0;
        const fiveStars = this.reviews.filter(r => r.rating >= 4.5).length;
        const lowRatings = this.reviews.filter(r => r.rating < 3).length;
        cards = `
          <div class="summary-card"><div class="value">${data.length}</div><div class="label">Total Reviews</div></div>
          <div class="summary-card"><div class="value">${avgRating.toFixed(1)} ⭐</div><div class="label">Avg. Rating</div></div>
          <div class="summary-card"><div class="value">${fiveStars}</div><div class="label">5-Star Reviews</div></div>
          <div class="summary-card"><div class="value">${lowRatings}</div><div class="label">Low Ratings (<3)</div></div>
        `;
        break;
    }

    return `<div class="summary-cards">${cards}</div>`;
  }

  private createExecutiveSummary(): string {
    if (!this.summary) return '';

    return `
      <div class="executive-summary">
        <h3>📋 Executive Summary</h3>
        <div class="exec-grid">
          <div class="exec-item">
            <div class="number">${this.summary.totalUsers}</div>
            <div class="desc">Total Users (${this.summary.activeUsers} active)</div>
          </div>
          <div class="exec-item">
            <div class="number">${this.summary.totalProducts}</div>
            <div class="desc">Products (${this.summary.lowStockProducts} low stock)</div>
          </div>
          <div class="exec-item">
            <div class="number">$${this.summary.totalRevenue.toLocaleString()}</div>
            <div class="desc">${this.summary.totalSales} Total Sales</div>
          </div>
          <div class="exec-item">
            <div class="number">${this.summary.averageRating} ⭐</div>
            <div class="desc">${this.summary.totalReviews} Reviews</div>
          </div>
        </div>
      </div>
    `;
  }

  private createTableContent(reportType: ReportType, data: any[]): string {
    if (data.length === 0) {
      return `<p style="text-align: center; color: #64748b; padding: 20px;">No data available</p>`;
    }

    const headers = reportType.columns.map(col => `<th>${col}</th>`).join('');
    let rows = '';

    switch (reportType.dataKey) {
      case 'users':
        rows = (data as UserReportData[]).map(user => `
          <tr>
            <td>${user.id}</td>
            <td><strong>${this.escapeHtml(user.username)}</strong></td>
            <td>${this.escapeHtml(user.firstName || '')} ${this.escapeHtml(user.lastName || '')}</td>
            <td>${this.escapeHtml(user.email)}</td>
            <td>${this.escapeHtml(user.phoneNumber || '-')}</td>
            <td><span class="status-badge">${user.role}</span></td>
            <td><span class="status-badge status-${user.active ? 'active' : 'inactive'}">${user.active ? 'Active' : 'Inactive'}</span></td>
            <td>${this.escapeHtml(user.city || '-')}</td>
            <td>${this.escapeHtml(user.country || '-')}</td>
            <td>${this.formatDate(user.createdAt)}</td>
          </tr>
        `).join('');
        break;

      case 'products':
        rows = (data as ProductReportData[]).map(product => `
          <tr>
            <td>${product.id}</td>
            <td><strong>${this.escapeHtml(this.truncate(product.name, 30))}</strong></td>
            <td>${this.escapeHtml(product.mark || '-')}</td>
            <td class="currency">$${(product.price || 0).toFixed(2)}</td>
            <td>${product.stock || 0}</td>
            <td>${product.discount ? product.discount + '%' : '-'}</td>
            <td class="rating">${(product.rating || 0).toFixed(1)} ⭐</td>
            <td>${product.reviewsCount || 0}</td>
            <td>${product.weight ? product.weight + 'kg' : '-'}</td>
          </tr>
        `).join('');
        break;

      case 'sales':
        rows = (data as SaleReportData[]).map(sale => `
          <tr>
            <td>${sale.id}</td>
            <td>${this.formatDate(sale.dateOfSale)}</td>
            <td>${sale.userId}</td>
            <td class="currency">$${(sale.totalAmount || 0).toFixed(2)}</td>
            <td>${this.escapeHtml(sale.paymentMethod || '-')}</td>
            <td><span class="status-badge status-${(sale.status || '').toLowerCase()}">${sale.status || '-'}</span></td>
          </tr>
        `).join('');
        break;

      case 'reviews':
        rows = (data as ReviewReportData[]).map(review => `
          <tr>
            <td>${review.id}</td>
            <td>${this.escapeHtml(review.userName || 'Anonymous')}</td>
            <td>${this.escapeHtml(this.truncate(review.productName || 'Product #' + review.productId, 25))}</td>
            <td class="rating">${(review.rating || 0).toFixed(1)} ⭐</td>
            <td>${this.escapeHtml(this.truncate(review.comment || '-', 40))}</td>
            <td>${this.formatDate(review.reviewDate)}</td>
          </tr>
        `).join('');
        break;
    }

    return `
      <div class="table-container">
        <div class="table-header">
          <span class="table-title">📋 Data Records</span>
          <span class="record-count">${data.length} entries</span>
        </div>
        <table>
          <thead><tr>${headers}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  private createPdfFooter(): string {
    return `
      <div class="report-footer">
        <div class="footer-brand">
          <strong>📊 SalesIQ</strong>
          <span>Business Intelligence Platform</span>
        </div>
        <div class="confidential">⚠ CONFIDENTIAL</div>
        <div class="footer-right">
          <div>Auto-generated report • Do not share externally</div>
          <div>© ${new Date().getFullYear()} SalesIQ - All Rights Reserved</div>
        </div>
      </div>
    `;
  }

  private downloadPdf(htmlContent: string, filename: string): void {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      this.showToast('Please allow popups to download the report', 'error');
      return;
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Note: User can save as PDF from print dialog
      }, 250);
    };
  }

  // Utility methods
  private formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  private formatDateTime(date: Date): string {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private formatDateForFile(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private truncate(str: string, length: number): string {
    if (!str) return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
  }

  private escapeHtml(str: string): string {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    const banner = document.createElement('div');
    banner.textContent = message;
    banner.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 9999;
      font-family: system-ui, sans-serif;
      font-size: 14px;
      animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(banner);
    setTimeout(() => {
      banner.style.opacity = '0';
      banner.style.transition = 'opacity 0.3s ease-out';
      setTimeout(() => document.body.removeChild(banner), 300);
    }, 3000);
  }

  refreshData(): void {
    this.loadAllData();
  }
}
