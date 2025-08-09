import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Code, 
  Bug, 
  ShieldCheck, 
  Zap, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Search,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useTesting } from '@/hooks/useTesting';

interface QualityIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  severity: 'high' | 'medium' | 'low';
  file: string;
  line: number;
  message: string;
  rule: string;
  fixable: boolean;
}

const CodeQualityDashboard = () => {
  const [selectedFile, setSelectedFile] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const {
    codeQuality,
    performance,
    loading,
    error,
    loadCodeQuality,
    loadPerformanceMetrics,
  } = useTesting();

  // Mock issues for display (would come from API in real implementation)
  const mockIssues: QualityIssue[] = [
    {
      id: '1',
      type: 'error',
      severity: 'high',
      file: 'src/components/auth/LoginForm.tsx',
      line: 45,
      message: 'Potential null pointer dereference',
      rule: 'null-safety',
      fixable: true,
    },
    {
      id: '2',
      type: 'warning',
      severity: 'medium',
      file: 'src/hooks/useApi.ts',
      line: 23,
      message: 'Missing error handling for async operation',
      rule: 'error-handling',
      fixable: false,
    },
    {
      id: '3',
      type: 'info',
      severity: 'low',
      file: 'src/utils/helpers.ts',
      line: 12,
      message: 'Consider using const assertion',
      rule: 'typescript-best-practices',
      fixable: true,
    },
  ];

  const handleAnalyze = useCallback(async () => {
    await loadCodeQuality();
    await loadPerformanceMetrics();
  }, [loadCodeQuality, loadPerformanceMetrics]);

  const getStatusColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (score: number) => {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'warning';
    return 'error';
  };

  const getIssueIcon = (type: QualityIssue['type']) => {
    switch (type) {
      case 'error':
        return <Bug className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: QualityIssue['severity']) => {
    const variants = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800',
    };
    
    return (
      <Badge className={variants[severity]}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  const filteredIssues = mockIssues.filter(issue => {
    const matchesFile = selectedFile === 'all' || issue.file.includes(selectedFile);
    const matchesSeverity = selectedSeverity === 'all' || issue.severity === selectedSeverity;
    const matchesSearch = !searchTerm || 
      issue.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.file.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFile && matchesSeverity && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Code Quality Dashboard</h1>
          <p className="text-gray-600">Monitor code quality metrics and issues</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleAnalyze}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleAnalyze} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Code className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Analyzing...' : 'Run Analysis'}
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

      {/* Quality Metrics Cards */}
      {codeQuality && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Coverage</p>
                  <p className={`text-2xl font-bold ${getStatusColor(codeQuality.coverage)}`}>
                    {codeQuality.coverage.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ShieldCheck className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Maintainability</p>
                  <p className={`text-2xl font-bold ${getStatusColor(codeQuality.maintainabilityIndex)}`}>
                    {codeQuality.maintainabilityIndex}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Bug className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Issues</p>
                  <p className="text-2xl font-bold">
                    {codeQuality.issues.reduce((sum, issue) => sum + issue.count, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Zap className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Technical Debt</p>
                  <p className="text-2xl font-bold">{codeQuality.technicalDebt}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Quality Metrics</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="coverage">Test Coverage</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Quality metrics would be fetched from codeQuality.metrics */}
            {/* For now, we'll show a placeholder or remove if not available */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Code Complexity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-600">N/A</span>
                  <span className="text-muted-foreground">/{codeQuality?.codeComplexityMaxScore || 'N/A'}</span>
                </div>
                <Progress value={0} /> {/* Placeholder */}
                <p className="text-xs text-muted-foreground">Description: N/A</p>
                <p className="text-xs text-muted-foreground">Suggestions: N/A</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Test Coverage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-600">N/A</span>
                  <span className="text-muted-foreground">/{codeQuality?.testCoverageMaxScore || 'N/A'}</span>
                </div>
                <Progress value={0} /> {/* Placeholder */}
                <p className="text-xs text-muted-foreground">Description: N/A</p>
                <p className="text-xs text-muted-foreground">Suggestions: N/A</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-600">N/A</span>
                  <span className="text-muted-foreground">/{codeQuality?.securityMaxScore || 'N/A'}</span>
                </div>
                <Progress value={0} /> {/* Placeholder */}
                <p className="text-xs text-muted-foreground">Description: N/A</p>
                <p className="text-xs text-muted-foreground">Suggestions: N/A</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-600">N/A</span>
                  <span className="text-muted-foreground">/{codeQuality?.performanceMaxScore || 'N/A'}</span>
                </div>
                <Progress value={0} /> {/* Placeholder */}
                <p className="text-xs text-muted-foreground">Description: N/A</p>
                <p className="text-xs text-muted-foreground">Suggestions: N/A</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <Input
                    placeholder="Search issues..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Issues List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Code Issues ({filteredIssues.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredIssues.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  No issues found
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredIssues.map((issue) => (
                    <div key={issue.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-3">
                          {getIssueIcon(issue.type)}
                          <div className="flex-1">
                            <h4 className="font-medium">{issue.message}</h4>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <span>{issue.file}:{issue.line}</span>
                              <span>•</span>
                              <span>{issue.rule}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getSeverityBadge(issue.severity)}
                          {issue.fixable && (
                            <Badge variant="outline" className="text-green-600">
                              Fixable
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coverage" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Statements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {codeQuality?.coverage?.statements || 'N/A'}%
                  </div>
                  <Progress value={codeQuality?.coverage?.statements || 0} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Branches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {codeQuality?.coverage?.branches || 'N/A'}%
                  </div>
                  <Progress value={codeQuality?.coverage?.branches || 0} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Functions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {codeQuality?.coverage?.functions || 'N/A'}%
                  </div>
                  <Progress value={codeQuality?.coverage?.functions || 0} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Lines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {codeQuality?.coverage?.lines || 'N/A'}%
                  </div>
                  <Progress value={codeQuality?.coverage?.lines || 0} />
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              Target coverage: 80%+ for statements, branches, functions, and lines.
              Current average: {codeQuality?.coverage ? Object.values(codeQuality.coverage).reduce((a, b) => a + b, 0) / 4 : 'N/A'}%
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CodeQualityDashboard;