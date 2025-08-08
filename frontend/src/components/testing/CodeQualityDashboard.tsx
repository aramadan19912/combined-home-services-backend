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
  Search
} from 'lucide-react';

interface QualityMetric {
  name: string;
  score: number;
  maxScore: number;
  status: 'excellent' | 'good' | 'warning' | 'error';
  description: string;
  suggestions?: string[];
}

interface CodeQualityReport {
  overall: number;
  metrics: QualityMetric[];
  issues: QualityIssue[];
  coverage: CoverageReport;
}

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

interface CoverageReport {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}

const CodeQualityDashboard = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const [qualityReport] = useState<CodeQualityReport>({
    overall: 85,
    metrics: [
      {
        name: 'Code Complexity',
        score: 8.2,
        maxScore: 10,
        status: 'good',
        description: 'Cyclomatic complexity average',
        suggestions: ['Consider breaking down complex functions', 'Use early returns to reduce nesting']
      },
      {
        name: 'Maintainability',
        score: 7.8,
        maxScore: 10,
        status: 'good',
        description: 'Code maintainability index',
        suggestions: ['Add more comments for complex logic', 'Extract reusable utilities']
      },
      {
        name: 'Test Coverage',
        score: 6.5,
        maxScore: 10,
        status: 'warning',
        description: 'Unit test coverage percentage',
        suggestions: ['Add tests for error handlers', 'Increase integration test coverage']
      },
      {
        name: 'Security',
        score: 9.1,
        maxScore: 10,
        status: 'excellent',
        description: 'Security vulnerability score',
        suggestions: ['Continue following security best practices']
      },
      {
        name: 'Performance',
        score: 7.2,
        maxScore: 10,
        status: 'good',
        description: 'Performance optimization score',
        suggestions: ['Optimize large bundle sizes', 'Add lazy loading for heavy components']
      },
      {
        name: 'Code Style',
        score: 9.5,
        maxScore: 10,
        status: 'excellent',
        description: 'ESLint and Prettier compliance',
        suggestions: ['Maintain consistent coding standards']
      }
    ],
    issues: [
      {
        id: '1',
        type: 'warning',
        severity: 'medium',
        file: 'src/components/auth/AuthForm.tsx',
        line: 42,
        message: 'Missing error boundary for async operation',
        rule: 'react-hooks/exhaustive-deps',
        fixable: false
      },
      {
        id: '2',
        type: 'error',
        severity: 'high',
        file: 'src/hooks/useApi.ts',
        line: 156,
        message: 'Potential memory leak in useEffect',
        rule: 'react-hooks/exhaustive-deps',
        fixable: true
      },
      {
        id: '3',
        type: 'warning',
        severity: 'low',
        file: 'src/utils/helpers.ts',
        line: 23,
        message: 'Function complexity too high (complexity: 12)',
        rule: 'complexity',
        fixable: false
      },
      {
        id: '4',
        type: 'info',
        severity: 'low',
        file: 'src/components/ui/Button.tsx',
        line: 8,
        message: 'Consider using React.memo for performance',
        rule: 'react/display-name',
        fixable: false
      },
      {
        id: '5',
        type: 'warning',
        severity: 'medium',
        file: 'src/pages/Dashboard.tsx',
        line: 67,
        message: 'Large component should be split into smaller components',
        rule: 'max-lines',
        fixable: false
      }
    ],
    coverage: {
      statements: 78.5,
      branches: 65.2,
      functions: 82.1,
      lines: 77.8
    }
  });

  const runAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsAnalyzing(false);
  }, []);

  const getStatusColor = (status: QualityMetric['status']) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: QualityMetric['status']) => {
    switch (status) {
      case 'excellent': return 'default';
      case 'good': return 'secondary';
      case 'warning': return 'outline';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  const getIssueIcon = (type: QualityIssue['type']) => {
    switch (type) {
      case 'error': return <Bug className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <FileText className="h-4 w-4 text-blue-500" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getSeverityBadge = (severity: QualityIssue['severity']) => {
    switch (severity) {
      case 'high': return <Badge variant="destructive">High</Badge>;
      case 'medium': return <Badge variant="secondary">Medium</Badge>;
      case 'low': return <Badge variant="outline">Low</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filteredIssues = qualityReport.issues.filter(issue => {
    const matchesFile = selectedFile === 'all' || issue.file.includes(selectedFile);
    const matchesSeverity = selectedSeverity === 'all' || issue.severity === selectedSeverity;
    const matchesSearch = searchTerm === '' || 
      issue.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.file.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFile && matchesSeverity && matchesSearch;
  });

  const getOverallGrade = (score: number) => {
    if (score >= 90) return { grade: 'A', color: 'text-green-600' };
    if (score >= 80) return { grade: 'B', color: 'text-blue-600' };
    if (score >= 70) return { grade: 'C', color: 'text-yellow-600' };
    if (score >= 60) return { grade: 'D', color: 'text-orange-600' };
    return { grade: 'F', color: 'text-red-600' };
  };

  const { grade, color } = getOverallGrade(qualityReport.overall);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Code Quality Dashboard</h1>
        <Button 
          onClick={runAnalysis} 
          disabled={isAnalyzing}
          className="gap-2"
        >
          <Code className="h-4 w-4" />
          {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
        </Button>
      </div>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Overall Code Quality Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{qualityReport.overall}</span>
              <span className="text-2xl text-muted-foreground">/100</span>
              <span className={`text-3xl font-bold ml-4 ${color}`}>
                Grade: {grade}
              </span>
            </div>
            {isAnalyzing && <Badge variant="secondary">Analyzing...</Badge>}
          </div>
          <Progress value={qualityReport.overall} className="w-full" />
        </CardContent>
      </Card>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Quality Metrics</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="coverage">Test Coverage</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {qualityReport.metrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                    <Badge variant={getStatusBadge(metric.status) as any}>
                      {metric.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                      {metric.score}
                    </span>
                    <span className="text-muted-foreground">/{metric.maxScore}</span>
                  </div>
                  <Progress value={(metric.score / metric.maxScore) * 100} />
                  <p className="text-xs text-muted-foreground">{metric.description}</p>
                  
                  {metric.suggestions && metric.suggestions.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium mb-1">Suggestions:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {metric.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span>•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
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
                    {qualityReport.coverage.statements}%
                  </div>
                  <Progress value={qualityReport.coverage.statements} />
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
                    {qualityReport.coverage.branches}%
                  </div>
                  <Progress value={qualityReport.coverage.branches} />
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
                    {qualityReport.coverage.functions}%
                  </div>
                  <Progress value={qualityReport.coverage.functions} />
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
                    {qualityReport.coverage.lines}%
                  </div>
                  <Progress value={qualityReport.coverage.lines} />
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              Target coverage: 80%+ for statements, branches, functions, and lines.
              Current average: {Object.values(qualityReport.coverage).reduce((a, b) => a + b, 0) / 4}%
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CodeQualityDashboard;