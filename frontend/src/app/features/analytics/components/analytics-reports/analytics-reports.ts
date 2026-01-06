import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AnalyticsReportService,
  RFMReportData,
  ChurnReportData,
  ForecastReportData,
  StockoutReportData,
  BestsellerReportData,
  SentimentReportData,
  AnomalyReportData,
  ABCReportData,
  AnalyticsReportSummary
} from '../../../../core/services/analytics-report.service';

interface AnalyticsReportType {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  dataKey: string;
  columns: string[];
}

@Component({
  selector: 'app-analytics-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analytics-reports.html',
  styleUrls: ['./analytics-reports.css']
})
export class AnalyticsReports implements OnInit {
  // Data stores
  rfmData: RFMReportData[] = [];
  churnData: ChurnReportData[] = [];
  forecastData: ForecastReportData[] = [];
  stockoutData: StockoutReportData[] = [];
  bestsellerData: BestsellerReportData[] = [];
  sentimentData: SentimentReportData[] = [];
  anomalyData: AnomalyReportData[] = [];
  abcData: ABCReportData[] = [];
  summary: AnalyticsReportSummary | null = null;

  // UI State
  isLoading = true;
  loadingMessage = 'Loading analytics data...';
  errorMessage = '';
  showPreviewModal = false;
  previewData: any[] = [];
  previewTitle = '';
  previewColumns: string[] = [];
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' = 'info';
  showToastFlag = false;

  // Report Types Configuration
  reportTypes: AnalyticsReportType[] = [
    {
      id: 'rfm',
      name: 'RFM Customer Segmentation',
      description: 'Customer segments based on Recency, Frequency, and Monetary value analysis',
      icon: '🎯',
      color: '#3b82f6',
      dataKey: 'rfm',
      columns: ['Customer ID', 'Segment', 'R-Score', 'F-Score', 'M-Score', 'Total Score', 'Recency (Days)', 'Purchases', 'Total Spent']
    },
    {
      id: 'churn',
      name: 'Churn Risk Analysis',
      description: 'Customers at risk of churning with probability scores and risk levels',
      icon: '⚠️',
      color: '#ef4444',
      dataKey: 'churn',
      columns: ['User ID', 'Churn Probability', 'Risk Level', 'Days Since Purchase', 'Total Purchases', 'Total Spent', 'Avg Order']
    },
    {
      id: 'forecast',
      name: 'Sales Forecast',
      description: 'Predicted sales revenue for the upcoming period using ML models',
      icon: '📈',
      color: '#10b981',
      dataKey: 'forecast',
      columns: ['Date', 'Predicted Revenue']
    },
    {
      id: 'stockout',
      name: 'Stockout Predictions',
      description: 'Products at risk of running out of stock with recommended reorder quantities',
      icon: '📦',
      color: '#f59e0b',
      dataKey: 'stockout',
      columns: ['Product ID', 'Product Name', 'Current Stock', 'Avg Daily Sales', 'Days Until Stockout', 'Risk Level', 'Reorder Qty']
    },
    {
      id: 'bestseller',
      name: 'Potential Bestsellers',
      description: 'Products showing strong potential to become bestsellers based on growth patterns',
      icon: '🏆',
      color: '#8b5cf6',
      dataKey: 'bestseller',
      columns: ['Product ID', 'Product Name', 'Category', 'Current Sales', 'Growth Rate', 'Potential Score', 'Level']
    },
    {
      id: 'sentiment',
      name: 'Sentiment Analysis',
      description: 'Customer review sentiment breakdown by product',
      icon: '💬',
      color: '#06b6d4',
      dataKey: 'sentiment',
      columns: ['Product ID', 'Product Name', 'Total Reviews', 'Positive', 'Neutral', 'Negative', 'Sentiment']
    },
    {
      id: 'anomaly',
      name: 'Anomaly Detection',
      description: 'Unusual patterns and deviations detected in sales and metrics',
      icon: '🔍',
      color: '#ec4899',
      dataKey: 'anomaly',
      columns: ['Date', 'Metric', 'Actual Value', 'Expected Value', 'Deviation %', 'Type', 'Severity']
    },
    {
      id: 'abc',
      name: 'ABC Classification',
      description: 'Product classification by revenue contribution (Pareto analysis)',
      icon: '📊',
      color: '#14b8a6',
      dataKey: 'abc',
      columns: ['Product ID', 'Product Name', 'Category', 'Total Revenue', 'Revenue %', 'Cumulative %', 'Class']
    }
  ];

  constructor(
    private analyticsReportService: AnalyticsReportService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.loadingMessage = 'Loading analytics data...';

    // Load all data in parallel with individual error handling
    this.loadRFMData();
    this.loadChurnData();
    this.loadForecastData();
    this.loadStockoutData();
    this.loadBestsellerData();
    this.loadSentimentData();
    this.loadAnomalyData();
    this.loadABCData();
    this.loadSummary();
  }

  private loadRFMData(): void {
    this.analyticsReportService.getRFMReport().subscribe({
      next: data => { this.rfmData = data; this.checkLoadingComplete(); },
      error: () => { this.rfmData = []; this.checkLoadingComplete(); }
    });
  }

  private loadChurnData(): void {
    this.analyticsReportService.getChurnReport().subscribe({
      next: data => { this.churnData = data; this.checkLoadingComplete(); },
      error: () => { this.churnData = []; this.checkLoadingComplete(); }
    });
  }

  private loadForecastData(): void {
    this.analyticsReportService.getForecastReport(30).subscribe({
      next: data => { this.forecastData = data; this.checkLoadingComplete(); },
      error: () => { this.forecastData = []; this.checkLoadingComplete(); }
    });
  }

  private loadStockoutData(): void {
    this.analyticsReportService.getStockoutReport().subscribe({
      next: data => { this.stockoutData = data; this.checkLoadingComplete(); },
      error: () => { this.stockoutData = []; this.checkLoadingComplete(); }
    });
  }

  private loadBestsellerData(): void {
    this.analyticsReportService.getBestsellerReport().subscribe({
      next: data => { this.bestsellerData = data; this.checkLoadingComplete(); },
      error: () => { this.bestsellerData = []; this.checkLoadingComplete(); }
    });
  }

  private loadSentimentData(): void {
    this.analyticsReportService.getSentimentReport().subscribe({
      next: data => { this.sentimentData = data; this.checkLoadingComplete(); },
      error: () => { this.sentimentData = []; this.checkLoadingComplete(); }
    });
  }

  private loadAnomalyData(): void {
    this.analyticsReportService.getAnomalyReport().subscribe({
      next: data => { this.anomalyData = data; this.checkLoadingComplete(); },
      error: () => { this.anomalyData = []; this.checkLoadingComplete(); }
    });
  }

  private loadABCData(): void {
    this.analyticsReportService.getABCReport().subscribe({
      next: data => { this.abcData = data; this.checkLoadingComplete(); },
      error: () => { this.abcData = []; this.checkLoadingComplete(); }
    });
  }

  private loadSummary(): void {
    this.analyticsReportService.getReportSummary().subscribe({
      next: data => { this.summary = data; this.checkLoadingComplete(); },
      error: () => { this.summary = null; this.checkLoadingComplete(); }
    });
  }

  private loadedCount = 0;
  private checkLoadingComplete(): void {
    this.loadedCount++;
    if (this.loadedCount >= 9) {
      this.ngZone.run(() => {
        this.isLoading = false;
        this.loadedCount = 0;
        this.cdr.detectChanges();
      });
    }
  }

  getDataForReport(reportType: AnalyticsReportType): any[] {
    switch (reportType.dataKey) {
      case 'rfm': return this.rfmData;
      case 'churn': return this.churnData;
      case 'forecast': return this.forecastData;
      case 'stockout': return this.stockoutData;
      case 'bestseller': return this.bestsellerData;
      case 'sentiment': return this.sentimentData;
      case 'anomaly': return this.anomalyData;
      case 'abc': return this.abcData;
      default: return [];
    }
  }

  getRecordCount(reportType: AnalyticsReportType): number {
    return this.getDataForReport(reportType).length;
  }

  // Preview Modal
  openPreview(reportType: AnalyticsReportType): void {
    const data = this.getDataForReport(reportType);
    if (data.length === 0) {
      this.showToast('No data available for preview', 'info');
      return;
    }
    this.previewTitle = reportType.name;
    this.previewColumns = reportType.columns;
    this.previewData = data.slice(0, 20);
    this.showPreviewModal = true;
  }

  closePreview(): void {
    this.showPreviewModal = false;
    this.previewData = [];
  }

  downloadPreviewReport(): void {
    const reportType = this.reportTypes.find(r => r.name === this.previewTitle);
    if (reportType) {
      this.generatePdf(reportType);
    }
  }

  getPreviewCellValue(row: any, colIndex: number, reportType: string): string {
    switch (reportType) {
      case 'RFM Customer Segmentation':
        return this.getRFMCellValue(row as RFMReportData, colIndex);
      case 'Churn Risk Analysis':
        return this.getChurnCellValue(row as ChurnReportData, colIndex);
      case 'Sales Forecast':
        return this.getForecastCellValue(row as ForecastReportData, colIndex);
      case 'Stockout Predictions':
        return this.getStockoutCellValue(row as StockoutReportData, colIndex);
      case 'Potential Bestsellers':
        return this.getBestsellerCellValue(row as BestsellerReportData, colIndex);
      case 'Sentiment Analysis':
        return this.getSentimentCellValue(row as SentimentReportData, colIndex);
      case 'Anomaly Detection':
        return this.getAnomalyCellValue(row as AnomalyReportData, colIndex);
      case 'ABC Classification':
        return this.getABCCellValue(row as ABCReportData, colIndex);
      default:
        return '-';
    }
  }

  private getRFMCellValue(row: RFMReportData, colIndex: number): string {
    const values = [
      row.customerId.toString(),
      row.segment,
      row.recencyScore.toString(),
      row.frequencyScore.toString(),
      row.monetaryScore.toString(),
      row.totalScore.toString(),
      row.recencyDays.toString() + ' days',
      row.purchaseCount.toString(),
      this.formatCurrency(row.totalSpent)
    ];
    return values[colIndex] || '-';
  }

  private getChurnCellValue(row: ChurnReportData, colIndex: number): string {
    const values = [
      row.userId.toString(),
      (row.churnProbability * 100).toFixed(1) + '%',
      row.riskLevel,
      row.daysSinceLastPurchase.toString() + ' days',
      row.totalPurchases.toString(),
      this.formatCurrency(row.totalSpent),
      this.formatCurrency(row.avgOrderValue)
    ];
    return values[colIndex] || '-';
  }

  private getForecastCellValue(row: ForecastReportData, colIndex: number): string {
    const values = [
      this.formatDate(row.date),
      this.formatCurrency(row.predictedRevenue)
    ];
    return values[colIndex] || '-';
  }

  private getStockoutCellValue(row: StockoutReportData, colIndex: number): string {
    const values = [
      row.productId.toString(),
      row.productName,
      row.currentStock.toString(),
      row.avgDailySales.toFixed(1),
      row.daysUntilStockout.toString(),
      row.riskLevel,
      row.recommendedReorder.toString()
    ];
    return values[colIndex] || '-';
  }

  private getBestsellerCellValue(row: BestsellerReportData, colIndex: number): string {
    const values = [
      row.productId.toString(),
      row.productName,
      row.category,
      row.currentSales.toString(),
      row.growthRate.toFixed(1) + '%',
      row.potentialScore.toFixed(0),
      row.potentialLevel
    ];
    return values[colIndex] || '-';
  }

  private getSentimentCellValue(row: SentimentReportData, colIndex: number): string {
    const values = [
      row.productId.toString(),
      row.productName,
      row.totalReviews.toString(),
      row.positiveCount.toString(),
      row.neutralCount.toString(),
      row.negativeCount.toString(),
      row.overallSentiment
    ];
    return values[colIndex] || '-';
  }

  private getAnomalyCellValue(row: AnomalyReportData, colIndex: number): string {
    const values = [
      this.formatDate(row.date),
      row.metric,
      this.formatCurrency(row.actualValue),
      this.formatCurrency(row.expectedValue),
      row.deviation.toFixed(1) + '%',
      row.anomalyType,
      row.severity
    ];
    return values[colIndex] || '-';
  }

  private getABCCellValue(row: ABCReportData, colIndex: number): string {
    const values = [
      row.productId.toString(),
      row.productName,
      row.category,
      this.formatCurrency(row.totalRevenue),
      row.revenuePercentage.toFixed(2) + '%',
      row.cumulativePercentage.toFixed(2) + '%',
      row.classification
    ];
    return values[colIndex] || '-';
  }

  // PDF Generation
  generatePdf(reportType: AnalyticsReportType): void {
    const data = this.getDataForReport(reportType);
    if (data.length === 0) {
      this.showToast('No data available to generate report', 'error');
      return;
    }

    this.showToast(`Generating ${reportType.name}...`, 'info');
    const htmlContent = this.createPdfDocument(reportType, data);
    this.downloadPdf(htmlContent, `${reportType.id}-report-${Date.now()}.pdf`);
  }

  generateComprehensiveReport(): void {
    const hasData = this.reportTypes.some(rt => this.getDataForReport(rt).length > 0);
    if (!hasData) {
      this.showToast('No analytics data available', 'error');
      return;
    }

    this.showToast('Generating comprehensive analytics report...', 'info');
    const htmlContent = this.createComprehensiveReport();
    this.downloadPdf(htmlContent, `analytics-comprehensive-report-${Date.now()}.pdf`);
  }

  private createPdfDocument(reportType: AnalyticsReportType, data: any[]): string {
    const styles = this.getPdfStyles();
    const header = this.createPdfHeader(reportType.name, reportType.icon);
    const insightsSection = this.createInsightsSection(reportType);
    const tableContent = this.createTableContent(reportType, data);
    const footer = this.createPdfFooter();

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${reportType.name} - SalesIQ Analytics</title>
        ${styles}
      </head>
      <body>
        ${header}
        <div class="content-wrapper">
          ${insightsSection}
          ${tableContent}
        </div>
        ${footer}
      </body>
      </html>
    `;
  }

  private createComprehensiveReport(): string {
    const styles = this.getPdfStyles();
    const header = this.createPdfHeader('Comprehensive Analytics Report', '📊');
    
    let content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Comprehensive Analytics Report - SalesIQ</title>
        ${styles}
      </head>
      <body>
        ${header}
        <div class="content-wrapper">
          ${this.createExecutiveSummary()}
    `;

    // Add each report section
    for (const reportType of this.reportTypes) {
      const data = this.getDataForReport(reportType);
      if (data.length > 0) {
        content += `
          <div class="section-divider">
            <h2>${reportType.icon} ${reportType.name}</h2>
            <p class="section-desc">${reportType.description}</p>
          </div>
          ${this.createInsightsSection(reportType)}
          ${this.createTableContent(reportType, data.slice(0, 25))}
          ${data.length > 25 ? `<p class="more-records">... and ${data.length - 25} more records</p>` : ''}
        `;
      }
    }

    content += `
        </div>
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
        }
        
        .report-header {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);
          color: white;
          padding: 25px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 4px solid #06b6d4;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 18px;
        }
        
        .logo-box {
          width: 55px;
          height: 55px;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          border: 1px solid rgba(255,255,255,0.2);
        }
        
        .header-title h1 {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
          letter-spacing: -0.5px;
        }
        
        .header-subtitle {
          font-size: 11px;
          opacity: 0.8;
          margin-top: 3px;
          color: #06b6d4;
          font-weight: 500;
        }
        
        .report-meta {
          text-align: right;
          font-size: 10px;
          line-height: 1.7;
        }
        
        .report-meta .company {
          font-size: 16px;
          font-weight: 700;
          background: linear-gradient(90deg, #06b6d4, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 3px;
        }
        
        .content-wrapper {
          padding: 30px 40px;
        }
        
        .insights-section {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .insight-card {
          flex: 1;
          background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          position: relative;
          overflow: hidden;
        }
        
        .insight-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }
        
        .insight-card.blue::before { background: linear-gradient(90deg, #3b82f6, #06b6d4); }
        .insight-card.green::before { background: linear-gradient(90deg, #10b981, #34d399); }
        .insight-card.purple::before { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }
        .insight-card.amber::before { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
        .insight-card.red::before { background: linear-gradient(90deg, #ef4444, #f87171); }
        
        .insight-card .icon {
          font-size: 24px;
          margin-bottom: 8px;
        }
        
        .insight-card .value {
          font-size: 28px;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.2;
        }
        
        .insight-card .label {
          font-size: 10px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-top: 4px;
          font-weight: 600;
        }
        
        .executive-summary {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          border-radius: 16px;
          padding: 25px 30px;
          margin-bottom: 30px;
          color: white;
        }
        
        .executive-summary h3 {
          font-size: 16px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .exec-grid {
          display: flex;
          justify-content: space-around;
          flex-wrap: wrap;
          gap: 20px;
        }
        
        .exec-item {
          text-align: center;
          padding: 15px 25px;
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        
        .exec-item .number {
          font-size: 32px;
          font-weight: 800;
          background: linear-gradient(90deg, #06b6d4, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .exec-item .desc {
          font-size: 10px;
          color: #94a3b8;
          margin-top: 5px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .section-divider {
          background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 100%);
          padding: 15px 25px;
          margin: 35px 0 25px 0;
          border-radius: 10px;
          border-left: 5px solid #8b5cf6;
          page-break-before: always;
        }
        
        .section-divider:first-of-type {
          page-break-before: auto;
        }
        
        .section-divider h2 {
          font-size: 16px;
          color: #0f172a;
          font-weight: 700;
          margin: 0;
        }
        
        .section-desc {
          font-size: 10px;
          color: #64748b;
          margin-top: 5px;
        }
        
        .table-container {
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          border: 1px solid #e2e8f0;
        }
        
        .table-header {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 14px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .table-title {
          font-weight: 700;
          font-size: 13px;
          color: #0f172a;
        }
        
        .record-count {
          background: linear-gradient(135deg, #0f172a, #1e3a5f);
          color: white;
          padding: 5px 14px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 600;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 0;
        }
        
        thead {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
        }
        
        th {
          color: white;
          padding: 14px 12px;
          text-align: left;
          font-weight: 600;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        td {
          padding: 12px;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
          font-size: 10px;
        }
        
        tbody tr {
          background: #ffffff;
          transition: background 0.2s;
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
        
        .risk-high, .risk-critical { background: #fee2e2; color: #991b1b; }
        .risk-medium { background: #fef3c7; color: #92400e; }
        .risk-low { background: #dcfce7; color: #166534; }
        
        .segment-champions { background: #dbeafe; color: #1e40af; }
        .segment-loyal { background: #dcfce7; color: #166534; }
        .segment-potential { background: #fef3c7; color: #92400e; }
        .segment-atrisk { background: #fee2e2; color: #991b1b; }
        
        .sentiment-positive { background: #dcfce7; color: #166534; }
        .sentiment-neutral { background: #f1f5f9; color: #475569; }
        .sentiment-negative { background: #fee2e2; color: #991b1b; }
        
        .class-a { background: #dbeafe; color: #1e40af; font-weight: 700; }
        .class-b { background: #fef3c7; color: #92400e; }
        .class-c { background: #f1f5f9; color: #64748b; }
        
        .currency { color: #059669; font-weight: 700; }
        .percentage { color: #8b5cf6; font-weight: 600; }
        .score { color: #0f172a; font-weight: 700; }
        
        .more-records {
          text-align: center;
          color: #64748b;
          font-style: italic;
          padding: 15px;
          background: #f8fafc;
          border-radius: 8px;
          margin-top: 15px;
        }
        
        .report-footer {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 18px 40px;
          border-top: 2px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 40px;
        }
        
        .footer-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .footer-brand strong {
          font-size: 14px;
          color: #0f172a;
        }
        
        .footer-brand span {
          font-size: 10px;
          color: #64748b;
        }
        
        .confidential {
          color: #7c3aed;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-size: 9px;
          padding: 6px 16px;
          border: 2px solid #c4b5fd;
          border-radius: 4px;
          background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
        }
        
        .footer-right {
          text-align: right;
          font-size: 9px;
          color: #94a3b8;
        }
        
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .report-header, thead, .insight-card, .executive-summary { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
          }
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
            <div class="header-subtitle">Advanced Analytics Intelligence Report</div>
          </div>
        </div>
        <div class="report-meta">
          <div class="company">SalesIQ Analytics</div>
          <div>Generated: ${this.formatDateTime(now)}</div>
          <div>Report ID: ANA-${Date.now().toString(36).toUpperCase()}</div>
        </div>
      </div>
    `;
  }

  private createInsightsSection(reportType: AnalyticsReportType): string {
    const data = this.getDataForReport(reportType);
    let cards = '';

    switch (reportType.dataKey) {
      case 'rfm':
        const champions = this.rfmData.filter(r => r.segment?.toLowerCase().includes('champion')).length;
        const loyal = this.rfmData.filter(r => r.segment?.toLowerCase().includes('loyal')).length;
        const atRisk = this.rfmData.filter(r => r.segment?.toLowerCase().includes('risk')).length;
        const avgScore = data.length > 0 ? this.rfmData.reduce((s, r) => s + r.totalScore, 0) / data.length : 0;
        cards = `
          <div class="insight-card blue"><div class="icon">👥</div><div class="value">${data.length}</div><div class="label">Total Customers</div></div>
          <div class="insight-card green"><div class="icon">🏆</div><div class="value">${champions}</div><div class="label">Champions</div></div>
          <div class="insight-card purple"><div class="icon">💎</div><div class="value">${loyal}</div><div class="label">Loyal Customers</div></div>
          <div class="insight-card red"><div class="icon">⚠️</div><div class="value">${atRisk}</div><div class="label">At Risk</div></div>
          <div class="insight-card amber"><div class="icon">📊</div><div class="value">${avgScore.toFixed(1)}</div><div class="label">Avg RFM Score</div></div>
        `;
        break;

      case 'churn':
        const highRisk = this.churnData.filter(c => c.riskLevel === 'HIGH').length;
        const mediumRisk = this.churnData.filter(c => c.riskLevel === 'MEDIUM').length;
        const avgChurn = data.length > 0 ? this.churnData.reduce((s, c) => s + c.churnProbability, 0) / data.length * 100 : 0;
        const totalAtRisk = this.churnData.filter(c => c.churnProbability > 0.5).length;
        cards = `
          <div class="insight-card blue"><div class="icon">👥</div><div class="value">${data.length}</div><div class="label">Analyzed Customers</div></div>
          <div class="insight-card red"><div class="icon">🚨</div><div class="value">${highRisk}</div><div class="label">High Risk</div></div>
          <div class="insight-card amber"><div class="icon">⚠️</div><div class="value">${mediumRisk}</div><div class="label">Medium Risk</div></div>
          <div class="insight-card purple"><div class="icon">📉</div><div class="value">${avgChurn.toFixed(1)}%</div><div class="label">Avg Churn Rate</div></div>
          <div class="insight-card green"><div class="icon">🎯</div><div class="value">${totalAtRisk}</div><div class="label">Action Required</div></div>
        `;
        break;

      case 'forecast':
        const totalForecast = this.forecastData.reduce((s, f) => s + f.predictedRevenue, 0);
        const avgDaily = data.length > 0 ? totalForecast / data.length : 0;
        const maxRevenue = Math.max(...this.forecastData.map(f => f.predictedRevenue), 0);
        const minRevenue = Math.min(...this.forecastData.map(f => f.predictedRevenue), 0);
        cards = `
          <div class="insight-card blue"><div class="icon">📅</div><div class="value">${data.length}</div><div class="label">Days Forecasted</div></div>
          <div class="insight-card green"><div class="icon">💰</div><div class="value">$${this.formatNumber(totalForecast)}</div><div class="label">Total Forecast</div></div>
          <div class="insight-card purple"><div class="icon">📈</div><div class="value">$${this.formatNumber(avgDaily)}</div><div class="label">Avg Daily Revenue</div></div>
          <div class="insight-card amber"><div class="icon">🔝</div><div class="value">$${this.formatNumber(maxRevenue)}</div><div class="label">Peak Day</div></div>
        `;
        break;

      case 'stockout':
        const critical = this.stockoutData.filter(s => s.riskLevel === 'CRITICAL').length;
        const high = this.stockoutData.filter(s => s.riskLevel === 'HIGH').length;
        const totalReorder = this.stockoutData.reduce((s, p) => s + p.recommendedReorder, 0);
        cards = `
          <div class="insight-card blue"><div class="icon">📦</div><div class="value">${data.length}</div><div class="label">Products Analyzed</div></div>
          <div class="insight-card red"><div class="icon">🚨</div><div class="value">${critical}</div><div class="label">Critical Risk</div></div>
          <div class="insight-card amber"><div class="icon">⚠️</div><div class="value">${high}</div><div class="label">High Risk</div></div>
          <div class="insight-card purple"><div class="icon">📋</div><div class="value">${totalReorder.toLocaleString()}</div><div class="label">Units to Reorder</div></div>
        `;
        break;

      case 'bestseller':
        const strongPotential = this.bestsellerData.filter(b => b.potentialScore >= 80).length;
        const goodPotential = this.bestsellerData.filter(b => b.potentialScore >= 60 && b.potentialScore < 80).length;
        const avgGrowth = data.length > 0 ? this.bestsellerData.reduce((s, b) => s + b.growthRate, 0) / data.length : 0;
        cards = `
          <div class="insight-card blue"><div class="icon">📦</div><div class="value">${data.length}</div><div class="label">Products Analyzed</div></div>
          <div class="insight-card green"><div class="icon">🚀</div><div class="value">${strongPotential}</div><div class="label">Strong Potential</div></div>
          <div class="insight-card purple"><div class="icon">📈</div><div class="value">${goodPotential}</div><div class="label">Good Potential</div></div>
          <div class="insight-card amber"><div class="icon">📊</div><div class="value">${avgGrowth.toFixed(1)}%</div><div class="label">Avg Growth Rate</div></div>
        `;
        break;

      case 'sentiment':
        const positive = this.sentimentData.filter(s => s.overallSentiment === 'POSITIVE').length;
        const negative = this.sentimentData.filter(s => s.overallSentiment === 'NEGATIVE').length;
        const neutral = this.sentimentData.filter(s => s.overallSentiment === 'NEUTRAL').length;
        const totalReviews = this.sentimentData.reduce((s, p) => s + p.totalReviews, 0);
        cards = `
          <div class="insight-card blue"><div class="icon">📦</div><div class="value">${data.length}</div><div class="label">Products Analyzed</div></div>
          <div class="insight-card green"><div class="icon">😊</div><div class="value">${positive}</div><div class="label">Positive Sentiment</div></div>
          <div class="insight-card amber"><div class="icon">😐</div><div class="value">${neutral}</div><div class="label">Neutral Sentiment</div></div>
          <div class="insight-card red"><div class="icon">😞</div><div class="value">${negative}</div><div class="label">Negative Sentiment</div></div>
          <div class="insight-card purple"><div class="icon">💬</div><div class="value">${totalReviews.toLocaleString()}</div><div class="label">Total Reviews</div></div>
        `;
        break;

      case 'anomaly':
        const criticalAnomalies = this.anomalyData.filter(a => a.severity === 'CRITICAL').length;
        const highAnomalies = this.anomalyData.filter(a => a.severity === 'HIGH').length;
        const spikes = this.anomalyData.filter(a => a.anomalyType === 'SPIKE').length;
        const drops = this.anomalyData.filter(a => a.anomalyType === 'DROP').length;
        cards = `
          <div class="insight-card blue"><div class="icon">🔍</div><div class="value">${data.length}</div><div class="label">Anomalies Detected</div></div>
          <div class="insight-card red"><div class="icon">🚨</div><div class="value">${criticalAnomalies}</div><div class="label">Critical</div></div>
          <div class="insight-card amber"><div class="icon">⚠️</div><div class="value">${highAnomalies}</div><div class="label">High Severity</div></div>
          <div class="insight-card green"><div class="icon">📈</div><div class="value">${spikes}</div><div class="label">Spikes</div></div>
          <div class="insight-card purple"><div class="icon">📉</div><div class="value">${drops}</div><div class="label">Drops</div></div>
        `;
        break;

      case 'abc':
        const classA = this.abcData.filter(a => a.classification === 'A').length;
        const classB = this.abcData.filter(a => a.classification === 'B').length;
        const classC = this.abcData.filter(a => a.classification === 'C').length;
        const totalRevenue = this.abcData.reduce((s, a) => s + a.totalRevenue, 0);
        cards = `
          <div class="insight-card blue"><div class="icon">📦</div><div class="value">${data.length}</div><div class="label">Total Products</div></div>
          <div class="insight-card green"><div class="icon">🥇</div><div class="value">${classA}</div><div class="label">Class A (80%)</div></div>
          <div class="insight-card amber"><div class="icon">🥈</div><div class="value">${classB}</div><div class="label">Class B (15%)</div></div>
          <div class="insight-card purple"><div class="icon">🥉</div><div class="value">${classC}</div><div class="label">Class C (5%)</div></div>
          <div class="insight-card red"><div class="icon">💰</div><div class="value">$${this.formatNumber(totalRevenue)}</div><div class="label">Total Revenue</div></div>
        `;
        break;
    }

    return `<div class="insights-section">${cards}</div>`;
  }

  private createExecutiveSummary(): string {
    if (!this.summary) return '';

    return `
      <div class="executive-summary">
        <h3>📋 Executive Analytics Summary</h3>
        <div class="exec-grid">
          <div class="exec-item">
            <div class="number">${this.summary.totalCustomers}</div>
            <div class="desc">Customers Analyzed</div>
          </div>
          <div class="exec-item">
            <div class="number">${this.summary.atRiskCustomers}</div>
            <div class="desc">At-Risk Customers</div>
          </div>
          <div class="exec-item">
            <div class="number">${this.summary.churnRate.toFixed(1)}%</div>
            <div class="desc">Churn Rate</div>
          </div>
          <div class="exec-item">
            <div class="number">${this.summary.lowStockProducts}</div>
            <div class="desc">Low Stock Alerts</div>
          </div>
          <div class="exec-item">
            <div class="number">$${this.formatNumber(this.summary.forecastedRevenue)}</div>
            <div class="desc">Forecasted Revenue</div>
          </div>
          <div class="exec-item">
            <div class="number">${this.summary.anomaliesDetected}</div>
            <div class="desc">Anomalies Found</div>
          </div>
        </div>
      </div>
    `;
  }

  private createTableContent(reportType: AnalyticsReportType, data: any[]): string {
    if (data.length === 0) {
      return `<p style="text-align: center; color: #64748b; padding: 30px;">No data available for this analysis</p>`;
    }

    const headers = reportType.columns.map(col => `<th>${col}</th>`).join('');
    let rows = '';

    switch (reportType.dataKey) {
      case 'rfm':
        rows = (data as RFMReportData[]).map(row => `
          <tr>
            <td>${row.customerId}</td>
            <td><span class="status-badge segment-${row.segment?.toLowerCase().replace(/\s+/g, '')}">${row.segment}</span></td>
            <td class="score">${row.recencyScore}</td>
            <td class="score">${row.frequencyScore}</td>
            <td class="score">${row.monetaryScore}</td>
            <td class="score"><strong>${row.totalScore}</strong></td>
            <td>${row.recencyDays} days</td>
            <td>${row.purchaseCount}</td>
            <td class="currency">$${row.totalSpent.toLocaleString()}</td>
          </tr>
        `).join('');
        break;

      case 'churn':
        rows = (data as ChurnReportData[]).map(row => `
          <tr>
            <td>${row.userId}</td>
            <td class="percentage">${(row.churnProbability * 100).toFixed(1)}%</td>
            <td><span class="status-badge risk-${row.riskLevel.toLowerCase()}">${row.riskLevel}</span></td>
            <td>${row.daysSinceLastPurchase} days</td>
            <td>${row.totalPurchases}</td>
            <td class="currency">$${row.totalSpent.toLocaleString()}</td>
            <td class="currency">$${row.avgOrderValue.toFixed(2)}</td>
          </tr>
        `).join('');
        break;

      case 'forecast':
        rows = (data as ForecastReportData[]).map(row => `
          <tr>
            <td><strong>${this.formatDate(row.date)}</strong></td>
            <td class="currency">$${row.predictedRevenue.toLocaleString()}</td>
          </tr>
        `).join('');
        break;

      case 'stockout':
        rows = (data as StockoutReportData[]).map(row => `
          <tr>
            <td>${row.productId}</td>
            <td><strong>${this.escapeHtml(row.productName)}</strong></td>
            <td>${row.currentStock.toLocaleString()}</td>
            <td>${row.avgDailySales.toFixed(1)}</td>
            <td>${row.daysUntilStockout} days</td>
            <td><span class="status-badge risk-${row.riskLevel.toLowerCase()}">${row.riskLevel}</span></td>
            <td class="score">${row.recommendedReorder.toLocaleString()}</td>
          </tr>
        `).join('');
        break;

      case 'bestseller':
        rows = (data as BestsellerReportData[]).map(row => `
          <tr>
            <td>${row.productId}</td>
            <td><strong>${this.escapeHtml(row.productName)}</strong></td>
            <td>${this.escapeHtml(row.category)}</td>
            <td>${row.currentSales.toLocaleString()}</td>
            <td class="percentage">${row.growthRate.toFixed(1)}%</td>
            <td class="score">${row.potentialScore.toFixed(0)}</td>
            <td><span class="status-badge">${row.potentialLevel}</span></td>
          </tr>
        `).join('');
        break;

      case 'sentiment':
        rows = (data as SentimentReportData[]).map(row => `
          <tr>
            <td>${row.productId}</td>
            <td><strong>${this.escapeHtml(row.productName)}</strong></td>
            <td>${row.totalReviews}</td>
            <td style="color: #16a34a;">${row.positiveCount}</td>
            <td style="color: #64748b;">${row.neutralCount}</td>
            <td style="color: #dc2626;">${row.negativeCount}</td>
            <td><span class="status-badge sentiment-${row.overallSentiment.toLowerCase()}">${row.overallSentiment}</span></td>
          </tr>
        `).join('');
        break;

      case 'anomaly':
        rows = (data as AnomalyReportData[]).map(row => `
          <tr>
            <td><strong>${this.formatDate(row.date)}</strong></td>
            <td>${row.metric}</td>
            <td class="currency">$${row.actualValue.toLocaleString()}</td>
            <td class="currency">$${row.expectedValue.toLocaleString()}</td>
            <td class="percentage">${row.deviation.toFixed(1)}%</td>
            <td>${row.anomalyType}</td>
            <td><span class="status-badge risk-${row.severity.toLowerCase()}">${row.severity}</span></td>
          </tr>
        `).join('');
        break;

      case 'abc':
        rows = (data as ABCReportData[]).map(row => `
          <tr>
            <td>${row.productId}</td>
            <td><strong>${this.escapeHtml(row.productName)}</strong></td>
            <td>${this.escapeHtml(row.category)}</td>
            <td class="currency">$${row.totalRevenue.toLocaleString()}</td>
            <td class="percentage">${row.revenuePercentage.toFixed(2)}%</td>
            <td class="percentage">${row.cumulativePercentage.toFixed(2)}%</td>
            <td><span class="status-badge class-${row.classification.toLowerCase()}">${row.classification}</span></td>
          </tr>
        `).join('');
        break;
    }

    return `
      <div class="table-container">
        <div class="table-header">
          <span class="table-title">📋 Analysis Results</span>
          <span class="record-count">${data.length} records</span>
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
          <strong>📊 SalesIQ Analytics</strong>
          <span>Advanced Business Intelligence Platform</span>
        </div>
        <div class="confidential">🔒 ANALYTICS CONFIDENTIAL</div>
        <div class="footer-right">
          <div>AI-Powered Analytics Report • Internal Use Only</div>
          <div>© ${new Date().getFullYear()} SalesIQ - All Rights Reserved</div>
        </div>
      </div>
    `;
  }

  private downloadPdf(htmlContent: string, filename: string): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      this.showToast('Please allow popups to download the report', 'error');
      return;
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 300);
    };
  }

  // Utility methods
  private formatDate(dateStr: string): string {
    if (!dateStr || dateStr === '-') return '-';
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

  private formatCurrency(value: number): string {
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  private formatNumber(value: number): string {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
    return value.toLocaleString();
  }

  private escapeHtml(text: string): string {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private truncate(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  showToast(message: string, type: 'success' | 'error' | 'info'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToastFlag = true;
    setTimeout(() => {
      this.showToastFlag = false;
    }, 3000);
  }
}
