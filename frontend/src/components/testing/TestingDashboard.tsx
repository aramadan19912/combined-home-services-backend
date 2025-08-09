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
  Activity,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useTesting, TestCase, TestSuite } from '@/hooks/useTesting';

const TestingDashboard = () => {
  const [selectedSuite, setSelectedSuite] = useState<string>('all');
  
  const {
    suites,
    codeQuality,
    performance,
    loading,
    runningTests,
    error,
    runTests,
    loadTestSuites,
    loadCodeQuality,
    loadPerformanceMetrics,
  } = useTesting();

  const isRunning = runningTests.size > 0;

  const getStatusIcon = (status: TestCase['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'skipped':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestCase['status']) => {
    const variants = {
      passed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      running: 'bg-blue-100 text-blue-800',
      skipped: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    
    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleRunTests = async (suiteId?: string) => {
    await runTests(suiteId);
  };

  const filteredSuites = selectedSuite === 'all' 
    ? suites 
    : suites.filter(suite => suite.id === selectedSuite);

  const totalTests = suites.reduce((acc, suite) => acc + suite.tests.length, 0);
  const passedTests = suites.reduce((acc, suite) => 
    acc + suite.tests.filter(test => test.status === 'passed').length, 0);
  const failedTests = suites.reduce((acc, suite) => 
    acc + suite.tests.filter(test => test.status === 'failed').length, 0);
  const runningTestsCount = suites.reduce((acc, suite) => 
    acc + suite.tests.filter(test => test.status === 'running').length, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Testing Dashboard</h1>
          <p className="text-gray-600">Monitor and manage automated tests</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              loadTestSuites();
              loadCodeQuality();
              loadPerformanceMetrics();
            }}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => handleRunTests()}
            disabled={isRunning || loading}
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            {isRunning ? 'Running...' : 'Run All Tests'}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Test Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tests</p>
                <p className="text-2xl font-bold">{totalTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Passed</p>
                <p className="text-2xl font-bold text-green-600">{passedTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{failedTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Running</p>
                <p className="text-2xl font-bold text-blue-600">{runningTestsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
          {filteredSuites.map(suite => (
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
                    onClick={() => handleRunTests(suite.id)} 
                    disabled={isRunning || loading}
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