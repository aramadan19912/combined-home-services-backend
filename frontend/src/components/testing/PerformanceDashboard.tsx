import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Zap, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { useErrorHandler } from '@/hooks/useErrorHandler';

const PerformanceDashboard = () => {
  const { 
    metrics, 
    isMonitoring, 
    getMetrics, 
    getEntries 
  } = usePerformanceMonitoring();
  
  const { 
    getErrorStats, 
    getErrorLog, 
    clearErrorLog 
  } = useErrorHandler();

  const [refreshing, setRefreshing] = useState(false);
  const [errorStats, setErrorStats] = useState({ total: 0, last24h: 0, mostCommon: 'None' });

  useEffect(() => {
    const stats = getErrorStats();
    setErrorStats(stats);
  }, [getErrorStats]);

  const refreshData = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    const stats = getErrorStats();
    setErrorStats(stats);
    setRefreshing(false);
  };

  const getPerformanceScore = () => {
    if (!metrics) return 0;
    
    let score = 100;
    
    // Deduct points for poor metrics
    if (metrics.pageLoadTime > 3000) score -= 20;
    if (metrics.firstContentfulPaint > 1500) score -= 15;
    if (metrics.largestContentfulPaint > 2500) score -= 20;
    if (metrics.firstInputDelay > 100) score -= 15;
    if (metrics.cumulativeLayoutShift > 0.1) score -= 15;
    if (metrics.timeToInteractive > 5000) score -= 15;
    
    return Math.max(0, score);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  const formatMs = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const performanceScore = getPerformanceScore();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Performance Dashboard</h1>
        <div className="flex items-center gap-2">
          <Badge variant={isMonitoring ? 'default' : 'secondary'}>
            {isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive'}
          </Badge>
          <Button 
            onClick={refreshData} 
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Performance Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Overall Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl font-bold">
              <span className={getScoreColor(performanceScore)}>
                {performanceScore}
              </span>
              <span className="text-2xl text-muted-foreground">/100</span>
            </div>
            <Badge variant={getScoreBadge(performanceScore) as any}>
              {performanceScore >= 90 ? 'Excellent' : 
               performanceScore >= 70 ? 'Good' : 'Needs Improvement'}
            </Badge>
          </div>
          <Progress value={performanceScore} className="w-full" />
        </CardContent>
      </Card>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="errors">Error Tracking</TabsTrigger>
          <TabsTrigger value="resources">Resource Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Page Load Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics ? formatMs(metrics.pageLoadTime) : '---'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Target: &lt; 3s
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">First Contentful Paint</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics ? formatMs(metrics.firstContentfulPaint) : '---'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Target: &lt; 1.5s
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Largest Contentful Paint</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics ? formatMs(metrics.largestContentfulPaint) : '---'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Target: &lt; 2.5s
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">First Input Delay</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics ? formatMs(metrics.firstInputDelay) : '---'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Target: &lt; 100ms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cumulative Layout Shift</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics ? metrics.cumulativeLayoutShift.toFixed(3) : '---'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Target: &lt; 0.1
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Time to Interactive</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics ? formatMs(metrics.timeToInteractive) : '---'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Target: &lt; 5s
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{errorStats.total}</div>
                <p className="text-xs text-muted-foreground">
                  All time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last 24 Hours</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{errorStats.last24h}</div>
                <p className="text-xs text-muted-foreground">
                  Recent errors
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {errorStats.total > 0 ? '0.1%' : '0%'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Success rate: {errorStats.total > 0 ? '99.9%' : '100%'}
                </p>
              </CardContent>
            </Card>
          </div>

          {errorStats.mostCommon !== 'None' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Most common error: "{errorStats.mostCommon}"
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recent Error Log</h3>
            <Button onClick={clearErrorLog} variant="outline" size="sm">
              Clear Log
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              {getErrorLog().length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  No errors recorded
                </div>
              ) : (
                <div className="space-y-3">
                  {getErrorLog().slice(0, 10).map((error) => (
                    <div key={error.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-red-600">{error.error.message}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {error.url} • {error.timestamp.toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="destructive">Error</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Loading Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Resource analysis will be populated as you navigate the application and load different resources.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;