/**
 * Executive Dashboard Models
 * Matches backend DTOs for comprehensive executive dashboard
 */

// Dashboard KPIs
export interface DashboardKPIsDto {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProductsSold: number;
  averageOrderValue: number;
  revenuePerCustomer: number;
  newCustomers: number;
  returningCustomers: number;
  averageBasketSize: number;
  totalReviews: number;
  averageRating: number;
  conversionRate: number;
}

// Top Product
export interface TopProductDto {
  productId: number;
  productName: string;
  categoryName: string;
  revenue: number;
  quantitySold: number;
  rank: number;
}

// Top Category
export interface TopCategoryDto {
  categoryId: number;
  categoryName: string;
  revenue: number;
  productCount: number;
  rank: number;
}

// Top Customer
export interface TopCustomerDto {
  userId: number;
  username: string;
  totalSpent: number;
  orderCount: number;
  rank: number;
}

// Revenue Breakdown
export interface RevenueBreakdownDto {
  byCategory: { [key: string]: number };
  byProduct: { [key: string]: number };
  byPeriod: { [key: string]: number };
}

// Customer Metrics
export interface CustomerMetricsDto {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  retentionRate: number;
  churnRate: number;
  avgLifetimeValue: number;
}

// Inventory Metrics
export interface InventoryMetricsDto {
  totalProducts: number;
  inStockProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  avgInventoryTurnover: number;
}

// Main Executive Dashboard DTO
export interface ExecutiveDashboardDto {
  startDate: string;
  endDate: string;
  generatedAt: string;
  
  kpis: DashboardKPIsDto;
  periodComparison: import('./periodComparison.model').PeriodComparisonDto | null;
  
  topProducts: TopProductDto[];
  topCategories: TopCategoryDto[];
  topCustomers: TopCustomerDto[];
  
  revenueBreakdown: RevenueBreakdownDto;
  customerMetrics: CustomerMetricsDto;
  inventoryMetrics: InventoryMetricsDto;
  
  healthScore: number;
  healthStatus: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';
  alerts: string[];
}

// Defaults
export const defaultDashboardKPIs: DashboardKPIsDto = {
  totalRevenue: 0,
  totalOrders: 0,
  totalCustomers: 0,
  totalProductsSold: 0,
  averageOrderValue: 0,
  revenuePerCustomer: 0,
  newCustomers: 0,
  returningCustomers: 0,
  averageBasketSize: 0,
  totalReviews: 0,
  averageRating: 0,
  conversionRate: 0
};

export const defaultExecutiveDashboard: ExecutiveDashboardDto = {
  startDate: '',
  endDate: '',
  generatedAt: '',
  kpis: defaultDashboardKPIs,
  periodComparison: null,
  topProducts: [],
  topCategories: [],
  topCustomers: [],
  revenueBreakdown: { byCategory: {}, byProduct: {}, byPeriod: {} },
  customerMetrics: {
    totalCustomers: 0,
    newCustomers: 0,
    returningCustomers: 0,
    retentionRate: 0,
    churnRate: 0,
    avgLifetimeValue: 0
  },
  inventoryMetrics: {
    totalProducts: 0,
    inStockProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    avgInventoryTurnover: 0
  },
  healthScore: 0,
  healthStatus: 'FAIR',
  alerts: []
};
