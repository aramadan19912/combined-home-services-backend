import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PlayCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Target,
  Activity
} from 'lucide-react';

interface TestCase {
  id: string;
  name: string;
  description: string;
  category: 'unit' | 'integration' | 'e2e' | 'performance';
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration?: number;
  error?: string;
  assertions?: number;
  passedAssertions?: number;
}

interface TestSuite {
  id: string;
  name: string;
  tests: TestCase[];
  status: 'pending' | 'running' | 'completed';
  startTime?: Date;
  endTime?: Date;
}

const TestingDashboard = () => {
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState<string>('all');

  // Mock test suites
  useEffect(() => {
    const mockSuites: TestSuite[] = [
      {
        id: 'auth',
        name: 'Authentication Tests',
        status: 'completed',
        tests: [
          {
            id: 'auth-1',
            name: 'Login with valid credentials',
            description: 'Should successfully login with correct email and password',
            category: 'integration',
            status: 'passed',
            duration: 245,
            assertions: 3,
            passedAssertions: 3,
          },
          {
            id: 'auth-2',
            name: 'Login with invalid credentials',
            description: 'Should reject login with incorrect credentials',
            category: 'integration',
            status: 'passed',
            duration: 156,
            assertions: 2,
            passedAssertions: 2,
          },
          {
            id: 'auth-3',
            name: 'Token validation',
            description: 'Should validate JWT tokens correctly',
            category: 'unit',
            status: 'failed',
            duration: 89,
            assertions: 4,
            passedAssertions: 3,
            error: 'Expected token to be valid, but got invalid',
          },
        ],
      },
      {
        id: 'orders',
        name: 'Order Management Tests',
        status: 'completed',
        tests: [
          {
            id: 'order-1',
            name: 'Create new order',
            description: 'Should create a new order successfully',
            category: 'integration',
            status: 'passed',
            duration: 312,
            assertions: 5,
            passedAssertions: 5,
          },
          {
            id: 'order-2',
            name: 'Update order status',
            description: 'Should update order status correctly',
            category: 'unit',
            status: 'passed',
            duration: 123,
            assertions: 3,
            passedAssertions: 3,
          },
          {
            id: 'order-3',
            name: 'Cancel order',
            description: 'Should cancel order and update status',
            category: 'integration',
            status: 'passed',
            duration: 234,
            assertions: 4,
            passedAssertions: 4,
          },
        ],
      },
      {
        id: 'performance',
        name: 'Performance Tests',
        status: 'pending',
        tests: [
          {
            id: 'perf-1',
            name: 'Page load time',
            description: 'Page should load within 3 seconds',
            category: 'performance',
            status: 'pending',
          },
          {
            id: 'perf-2',
            name: 'API response time',
            description: 'API should respond within 500ms',
            category: 'performance',
            status: 'pending',
          },
        ],
      },
      {
        id: 'e2e',
        name: 'End-to-End Tests',
        status: 'pending',
        tests: [
          {
            id: 'e2e-1',
            name: 'Complete user journey',
            description: 'User can browse, book, and pay for a service',
            category: 'e2e',
            status: 'pending',
          },
          {
            id: 'e2e-2',
            name: 'Provider workflow',
            description: 'Provider can accept and complete orders',
            category: 'e2e',
            status: 'pending',
          },
        ],
      },
    ];

    setSuites(mockSuites);
  }, []);

  const runTests = useCallback(async (suiteId?: string) => {
    setIsRunning(true);
    
    const suitesToRun = suiteId ? suites.filter(s => s.id === suiteId) : suites;
    
    for (const suite of suitesToRun) {
      // Update suite status
      setSuites(prev => prev.map(s => 
        s.id === suite.id 
          ? { ...s, status: 'running', startTime: new Date() }
          : s
      ));

      // Run tests in the suite
      for (const test of suite.tests) {
        // Update test status to running
        setSuites(prev => prev.map(s => 
          s.id === suite.id 
            ? {
                ...s,
                tests: s.tests.map(t => 
                  t.id === test.id ? { ...t, status: 'running' } : t
                )
              }
            : s
        ));

        // Simulate test execution
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));

        // Update test with result
        const passed = Math.random() > 0.1; // 90% pass rate
        setSuites(prev => prev.map(s => 
          s.id === suite.id 
            ? {
                ...s,
                tests: s.tests.map(t => 
                  t.id === test.id 
                    ? { 
                        ...t, 
                        status: passed ? 'passed' : 'failed',
                        duration: Math.floor(Math.random() * 500 + 100),
                        assertions: test.assertions || Math.floor(Math.random() * 5 + 1),
                        passedAssertions: passed ? (test.assertions || Math.floor(Math.random() * 5 + 1)) : Math.floor(Math.random() * 3),
                        error: passed ? undefined : 'Mock test failure'
                      } 
                    : t
                )
              }
            : s
        ));
      }

      // Update suite status to completed
      setSuites(prev => prev.map(s => 
        s.id === suite.id 
          ? { ...s, status: 'completed', endTime: new Date() }
          : s
      ));
    }

    setIsRunning(false);
  }, [suites]);

  const getOverallStats = () => {
    const allTests = suites.flatMap(s => s.tests);
    const totalTests = allTests.length;
    const passedTests = allTests.filter(t => t.status === 'passed').length;
    const failedTests = allTests.filter(t => t.status === 'failed').length;
    const pendingTests = allTests.filter(t => t.status === 'pending').length;
    const runningTests = allTests.filter(t => t.status === 'running').length;
    
    return {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      pending: pendingTests,
      running: runningTests,
      passRate: totalTests > 0 ? (passedTests / (passedTests + failedTests)) * 100 : 0,
    };
  };

  const getStatusIcon = (status: TestCase['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Activity className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: TestCase['status']) => {
    switch (status) {
      case 'passed':
        return <Badge variant="default" className="bg-green-500">Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'running':
        return <Badge variant="secondary">Running</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const stats = getOverallStats();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Testing Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => runTests()} 
            disabled={isRunning}
            className="gap-2"
          >
            <PlayCircle className="h-4 w-4" />
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.passRate.toFixed(1)}%
            </div>
            <Progress value={stats.passRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {stats.running > 0 && (
        <Alert>
          <Activity className="h-4 w-4 animate-spin" />
          <AlertDescription>
            {stats.running} test(s) currently running...
          </AlertDescription>
        </Alert>
      )}

      {/* Test Suites */}
      <Tabs defaultValue="all" value={selectedSuite} onValueChange={setSelectedSuite}>
        <TabsList>
          <TabsTrigger value="all">All Tests</TabsTrigger>
          {suites.map(suite => (
            <TabsTrigger key={suite.id} value={suite.id}>
              {suite.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {suites.map(suite => (
            <Card key={suite.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {suite.name}
                    <Badge variant={
                      suite.status === 'completed' ? 'default' :
                      suite.status === 'running' ? 'secondary' : 'outline'
                    }>
                      {suite.status}
                    </Badge>
                  </CardTitle>
                  <Button 
                    onClick={() => runTests(suite.id)} 
                    disabled={isRunning}
                    variant="outline"
                    size="sm"
                  >
                    <PlayCircle className="h-4 w-4 mr-1" />
                    Run Suite
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suite.tests.map(test => (
                    <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <h4 className="font-medium">{test.name}</h4>
                          <p className="text-sm text-muted-foreground">{test.description}</p>
                          {test.error && (
                            <p className="text-sm text-red-500 mt-1">{test.error}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{test.category}</Badge>
                        {getStatusBadge(test.status)}
                        {test.duration && (
                          <span className="text-sm text-muted-foreground">
                            {test.duration}ms
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {suites.map(suite => (
          <TabsContent key={suite.id} value={suite.id} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{suite.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suite.tests.map(test => (
                    <div key={test.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(test.status)}
                          <h4 className="font-medium">{test.name}</h4>
                        </div>
                        {getStatusBadge(test.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{test.description}</p>
                      
                      {test.assertions && (
                        <div className="flex items-center gap-4 text-sm">
                          <span>Assertions: {test.passedAssertions}/{test.assertions}</span>
                          {test.duration && <span>Duration: {test.duration}ms</span>}
                        </div>
                      )}
                      
                      {test.error && (
                        <Alert variant="destructive" className="mt-3">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{test.error}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default TestingDashboard;