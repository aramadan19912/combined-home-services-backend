/**
 * Integration Test Utility
 * This file provides simple functions to test API integration
 * and ensure data mapping works correctly.
 */

import { 
  servicesApi, 
  categoriesApi, 
  ordersApi, 
  providersApi,
  reviewsApi,
  paymentsApi,
  dashboardsApi,
  analyticsApi,
  notificationsApi,
  fileUploadApi,
  calendarApi,
  testingApi,
  complaintsApi,
  userProfileApi
} from '@/services/api';

interface IntegrationTestResult {
  endpoint: string;
  success: boolean;
  error?: string;
  data?: any;
  responseTime?: number;
}

export class IntegrationTester {
  private results: IntegrationTestResult[] = [];

  async testEndpoint(
    name: string, 
    apiCall: () => Promise<any>
  ): Promise<IntegrationTestResult> {
    const startTime = Date.now();
    
    try {
      const data = await apiCall();
      const responseTime = Date.now() - startTime;
      
      const result: IntegrationTestResult = {
        endpoint: name,
        success: true,
        data,
        responseTime
      };
      
      this.results.push(result);
      console.log(`✅ ${name}: ${responseTime}ms`);
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      const result: IntegrationTestResult = {
        endpoint: name,
        success: false,
        error: errorMessage,
        responseTime
      };
      
      this.results.push(result);
      console.log(`❌ ${name}: ${errorMessage} (${responseTime}ms)`);
      return result;
    }
  }

  async runBasicAPITests(): Promise<IntegrationTestResult[]> {
    console.log('🚀 Starting API Integration Tests...');
    
    // Test basic endpoints
    await this.testEndpoint('Get Services', () => servicesApi.getServices());
    await this.testEndpoint('Get Categories', () => categoriesApi.getCategories());
    await this.testEndpoint('Get Popular Categories', () => categoriesApi.getPopularCategories(5));
    
    // Test dashboard endpoints
    await this.testEndpoint('Get Customer Dashboard', () => dashboardsApi.getCustomerDashboard());
    await this.testEndpoint('Get Analytics Dashboard', () => analyticsApi.getDashboard());
    
    // Test notifications
    await this.testEndpoint('Get Notifications', () => notificationsApi.getNotifications());
    
    // Test calendar
    await this.testEndpoint('Get Calendar Events', () => calendarApi.getEvents());
    
    // Test testing endpoints
    await this.testEndpoint('Get Test Suites', () => testingApi.getTestSuites());
    await this.testEndpoint('Get Code Quality', () => testingApi.getCodeQuality());
    await this.testEndpoint('Get Performance Metrics', () => testingApi.getPerformanceMetrics());
    
    return this.results;
  }

  async runAuthenticatedTests(): Promise<IntegrationTestResult[]> {
    console.log('🔐 Starting Authenticated API Tests...');
    
    // Test user-specific endpoints
    await this.testEndpoint('Get My Orders', () => ordersApi.getMyOrders());
    await this.testEndpoint('Get My Complaints', () => complaintsApi.getMyComplaints());
    await this.testEndpoint('Get User Profile', () => userProfileApi.getProfile());
    
    return this.results;
  }

  async runFileUploadTest(testFile?: File): Promise<IntegrationTestResult> {
    console.log('📁 Testing File Upload...');
    
    if (!testFile) {
      // Create a simple test file
      const testContent = 'This is a test file for API integration';
      testFile = new File([testContent], 'test.txt', { type: 'text/plain' });
    }
    
    return await this.testEndpoint('File Upload', () => fileUploadApi.uploadFile(testFile!));
  }

  getResults(): IntegrationTestResult[] {
    return this.results;
  }

  getSummary() {
    const total = this.results.length;
    const successful = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const avgResponseTime = this.results.reduce((sum, r) => sum + (r.responseTime || 0), 0) / total;
    
    return {
      total,
      successful,
      failed,
      successRate: (successful / total) * 100,
      avgResponseTime: Math.round(avgResponseTime)
    };
  }

  printSummary() {
    const summary = this.getSummary();
    
    console.log('\n📊 Integration Test Summary:');
    console.log(`Total Tests: ${summary.total}`);
    console.log(`Successful: ${summary.successful}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Success Rate: ${summary.successRate.toFixed(1)}%`);
    console.log(`Average Response Time: ${summary.avgResponseTime}ms`);
    
    if (summary.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => !r.success)
        .forEach(r => console.log(`  - ${r.endpoint}: ${r.error}`));
    }
  }

  reset() {
    this.results = [];
  }
}

// Export convenience functions
export const runAPITests = async () => {
  const tester = new IntegrationTester();
  await tester.runBasicAPITests();
  tester.printSummary();
  return tester.getResults();
};

export const runFullIntegrationTest = async () => {
  const tester = new IntegrationTester();
  
  // Run basic tests first
  await tester.runBasicAPITests();
  
  // Then authenticated tests (if user is logged in)
  const token = localStorage.getItem('auth_token');
  if (token) {
    await tester.runAuthenticatedTests();
  }
  
  // Test file upload
  await tester.runFileUploadTest();
  
  tester.printSummary();
  return tester.getResults();
};

// Make tester available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).apiTester = IntegrationTester;
  (window as any).runAPITests = runAPITests;
  (window as any).runFullIntegrationTest = runFullIntegrationTest;
}