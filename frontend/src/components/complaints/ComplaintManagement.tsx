import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Clock, CheckCircle, XCircle, MessageSquare, User, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Complaint {
  id: string;
  customerName: string;
  providerName: string;
  subject: string;
  description: string;
  category: 'service-quality' | 'billing' | 'communication' | 'scheduling' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  resolution?: string;
}

export const ComplaintManagement: React.FC = () => {
  const [complaints] = useState<Complaint[]>([
    {
      id: '1',
      customerName: 'John Smith',
      providerName: 'ABC Plumbing',
      subject: 'Poor service quality',
      description: 'The plumber arrived late and did not complete the work properly.',
      category: 'service-quality',
      priority: 'high',
      status: 'open',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      customerName: 'Jane Doe',
      providerName: 'CleanCo Services',
      subject: 'Billing dispute',
      description: 'I was charged for services that were not performed.',
      category: 'billing',
      priority: 'medium',
      status: 'investigating',
      createdAt: '2024-01-14T15:45:00Z',
      updatedAt: '2024-01-16T09:20:00Z',
    },
  ]);

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [resolution, setResolution] = useState('');
  const { toast } = useToast();

  const getPriorityColor = (priority: Complaint['priority']) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Complaint['status']) => {
    switch (status) {
      case 'open': return <AlertTriangle className="h-4 w-4" />;
      case 'investigating': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const handleStatusUpdate = (status: Complaint['status']) => {
    toast({
      title: "Status updated",
      description: `Complaint status changed to ${status}`,
    });
  };

  const handleResolve = () => {
    if (!resolution.trim()) {
      toast({
        title: "Resolution required",
        description: "Please provide a resolution before closing the complaint.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Complaint resolved",
      description: "The complaint has been marked as resolved.",
    });
    setResolution('');
    setSelectedComplaint(null);
  };

  const filterComplaintsByStatus = (status: string) => {
    if (status === 'all') return complaints;
    return complaints.filter(complaint => complaint.status === status);
  };

  const ComplaintCard = ({ complaint }: { complaint: Complaint }) => (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-shadow ${
        selectedComplaint?.id === complaint.id ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => setSelectedComplaint(complaint)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base truncate">{complaint.subject}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getPriorityColor(complaint.priority)}>
              {complaint.priority}
            </Badge>
            {getStatusIcon(complaint.status)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span className="font-medium">Customer:</span> {complaint.customerName}
          </div>
          <p><span className="font-medium">Provider:</span> {complaint.providerName}</p>
          <p><span className="font-medium">Category:</span> {complaint.category.replace('-', ' ')}</p>
          <p className="line-clamp-2">{complaint.description}</p>
          <div className="flex items-center gap-1 text-xs">
            <Calendar className="h-3 w-3" />
            <span>Created: {format(new Date(complaint.createdAt), 'MMM dd, yyyy')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="open">Open</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="space-y-4 mt-4">
                {complaints.map((complaint) => (
                  <ComplaintCard key={complaint.id} complaint={complaint} />
                ))}
              </TabsContent>
              <TabsContent value="open" className="space-y-4 mt-4">
                {filterComplaintsByStatus('open').map((complaint) => (
                  <ComplaintCard key={complaint.id} complaint={complaint} />
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        {selectedComplaint ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedComplaint.subject}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(selectedComplaint.priority)}>
                    {selectedComplaint.priority}
                  </Badge>
                  <Badge variant="outline">
                    {selectedComplaint.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Customer Information</h4>
                  <p className="text-sm text-muted-foreground">{selectedComplaint.customerName}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Provider Information</h4>
                  <p className="text-sm text-muted-foreground">{selectedComplaint.providerName}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedComplaint.description}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Update Status</h4>
                <Select 
                  value={selectedComplaint.status} 
                  onValueChange={handleStatusUpdate}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h4 className="font-medium mb-2">Resolution</h4>
                <Textarea
                  placeholder="Enter resolution details..."
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="min-h-24"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleResolve} className="bg-green-600 hover:bg-green-700">
                  Mark as Resolved
                </Button>
                <Button variant="outline" onClick={() => handleStatusUpdate('investigating')}>
                  Start Investigation
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a complaint to view details</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};