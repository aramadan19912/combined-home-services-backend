import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Download, Eye, Check, X, MoreVertical, FileText, User, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { providersApi, notificationsApi } from '@/services/api';
import { Provider } from '@/types/api';

const mockProviders: Provider[] = [
  {
    id: '1',
    fullName: 'Ahmed Hassan',
    email: 'ahmed@example.com',
    phoneNumber: '+1234567890',
    specialization: 'Plumbing',
    serviceCategories: ['Plumbing', 'HVAC'],
    status: 'pending',
    submittedAt: '2024-01-15T10:30:00Z',
    documents: {
      profilePhoto: '/placeholder-avatar.jpg',
      nationalId: 'id_document.pdf',
      commercialRegistration: 'cr_document.pdf',
      businessLicense: 'license_document.pdf',
    },
    businessInfo: {
      businessName: 'Hassan Plumbing Services',
      businessType: 'individual',
      experience: 'experienced',
      serviceArea: 'Downtown, Midtown',
      bio: 'Professional plumber with 8 years of experience in residential and commercial plumbing services.',
    },
    rating: 4.8,
    totalJobs: 156,
    earnings: 12500,
  },
  {
    id: '2',
    fullName: 'Sara Mohamed',
    email: 'sara@example.com',
    phoneNumber: '+1234567891',
    specialization: 'Cleaning',
    serviceCategories: ['Cleaning'],
    status: 'approved',
    submittedAt: '2024-01-10T14:20:00Z',
    reviewedAt: '2024-01-12T09:15:00Z',
    documents: {
      profilePhoto: '/placeholder-avatar.jpg',
      nationalId: 'id_document.pdf',
      commercialRegistration: 'cr_document.pdf',
    },
    businessInfo: {
      businessName: 'SparkleClean Services',
      businessType: 'company',
      experience: 'intermediate',
      serviceArea: 'City Center, North District',
      bio: 'Professional cleaning service with eco-friendly products and reliable staff.',
    },
    rating: 4.9,
    totalJobs: 234,
    earnings: 18750,
  },
  {
    id: '3',
    fullName: 'Omar Ali',
    email: 'omar@example.com',
    phoneNumber: '+1234567892',
    specialization: 'Electrical',
    serviceCategories: ['Electrical', 'Security Systems'],
    status: 'rejected',
    submittedAt: '2024-01-08T11:45:00Z',
    reviewedAt: '2024-01-09T16:30:00Z',
    rejectionReason: 'Incomplete documentation - missing insurance certificate',
    documents: {
      profilePhoto: '/placeholder-avatar.jpg',
      nationalId: 'id_document.pdf',
    },
    businessInfo: {
      businessName: 'Ali Electrical Works',
      businessType: 'individual',
      experience: 'beginner',
      serviceArea: 'South District',
      bio: 'Certified electrician specializing in residential electrical installations and repairs.',
    },
    rating: 0,
    totalJobs: 0,
    earnings: 0,
  },
];

export const ProviderManagement: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | null>(null);

  // Load providers from API
  const loadProviders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let providerData: Provider[] = [];
      
      if (statusFilter === 'all') {
        providerData = await providersApi.admin.getAll();
      } else {
        providerData = await providersApi.admin.search(statusFilter);
      }
      
      setProviders(providerData);
    } catch (err) {
      console.error('Failed to load providers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load providers');
      setProviders([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  // Load providers on mount and when status filter changes
  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || provider.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: providers.length,
    pending: providers.filter(p => p.status === 'pending').length,
    approved: providers.filter(p => p.status === 'approved').length,
    rejected: providers.filter(p => p.status === 'rejected').length,
  };

  const handleProviderSelect = (providerId: string, checked: boolean) => {
    if (checked) {
      setSelectedProviders(prev => [...prev, providerId]);
    } else {
      setSelectedProviders(prev => prev.filter(id => id !== providerId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProviders(filteredProviders.map(p => p.id));
    } else {
      setSelectedProviders([]);
    }
  };

  const handleReviewProvider = (provider: Provider, action: 'approve' | 'reject') => {
    setSelectedProvider(provider);
    setReviewAction(action);
    setIsReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedProvider || !reviewAction) return;

    try {
      if (reviewAction === 'approve') {
        await providersApi.admin.approve(selectedProvider.id);
      } else {
        await providersApi.admin.reject(selectedProvider.id);
      }

      // Reload providers to get updated data
      await loadProviders();

      toast({
        title: `Provider ${reviewAction === 'approve' ? 'Approved' : 'Rejected'}`,
        description: `${selectedProvider.userName} has been ${reviewAction}d successfully.`,
      });

      // Notify
      try {
        await notificationsApi.sendToMe({ 
          title: 'Provider status updated', 
          message: `${selectedProvider.userName} ${reviewAction}d`, 
          type: 'info' 
        } as any);
      } catch {}

    } catch (err) {
      console.error('Failed to update provider status:', err);
      toast({
        title: 'Error',
        description: 'Failed to update provider status. Please try again.',
        variant: 'destructive',
      });
    }

    setIsReviewDialogOpen(false);
    setSelectedProvider(null);
    setReviewAction(null);
    setRejectionReason('');
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedProviders.length === 0) return;

    setProviders(prev => prev.map(provider => 
      selectedProviders.includes(provider.id)
        ? {
            ...provider,
            status: bulkAction === 'approve' ? 'approved' : 'rejected',
            reviewedAt: new Date().toISOString(),
            rejectionReason: bulkAction === 'reject' ? rejectionReason : undefined,
          }
        : provider
    ));

    toast({
      title: `Bulk Action Completed`,
      description: `${selectedProviders.length} providers have been ${bulkAction}d.`,
    });
    try {
      if (bulkAction === 'approve') await providersApi.admin.bulkApprove(selectedProviders);
      if (bulkAction === 'reject') await providersApi.admin.bulkReject({ ids: selectedProviders, reason: rejectionReason });
      await notificationsApi.sendToMe({ title: 'Bulk update', message: `${selectedProviders.length} providers ${bulkAction}d`, type: 'info' } as any);
    } catch {}


    setIsBulkActionDialogOpen(false);
    setSelectedProviders([]);
    setBulkAction(null);
    setRejectionReason('');
  };

  const downloadDocument = async (filename: string, displayName: string) => {
    try {
      if (!selectedProvider) return;
      // Route to API based on doc type
      let blobResp: any = null;
      if (displayName === 'National ID') {
        blobResp = await providersApi.admin.downloadId(selectedProvider.id);
      } else if (displayName === 'Commercial Registration') {
        blobResp = await providersApi.admin.downloadCr(selectedProvider.id);
      }
      if (blobResp) {
        const blob = (blobResp as any).data || (blobResp as any);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        toast({ title: 'Download started', description: `${displayName} downloading...` });
        return;
      }
      toast({ title: 'Download unavailable', description: 'Document type not supported.', variant: 'destructive' });
    } catch {
      toast({ title: 'Download failed', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: Provider['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Provider Management</h1>
          <p className="text-muted-foreground">Manage provider applications and approvals</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {selectedProviders.length > 0 && (
            <Dialog open={isBulkActionDialogOpen} onOpenChange={setIsBulkActionDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  Bulk Actions ({selectedProviders.length})
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Actions</DialogTitle>
                  <DialogDescription>
                    Perform actions on {selectedProviders.length} selected providers
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setBulkAction('approve')}
                      className={bulkAction === 'approve' ? 'bg-green-50 border-green-300' : ''}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve All
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setBulkAction('reject')}
                      className={bulkAction === 'reject' ? 'bg-red-50 border-red-300' : ''}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject All
                    </Button>
                  </div>
                  {bulkAction === 'reject' && (
                    <div className="space-y-2">
                      <Label htmlFor="bulkRejectionReason">Rejection Reason</Label>
                      <Textarea
                        id="bulkRejectionReason"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Enter reason for rejection..."
                        rows={3}
                      />
                    </div>
                  )}
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsBulkActionDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleBulkAction} disabled={!bulkAction}>
                      Apply
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card key={status} className={`cursor-pointer transition-colors ${statusFilter === status ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setStatusFilter(status)}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground capitalize">
                    {status === 'all' ? 'Total' : status}
                  </p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
                <div className={`p-2 rounded-full ${
                  status === 'pending' ? 'bg-yellow-100' :
                  status === 'approved' ? 'bg-green-100' :
                  status === 'rejected' ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  <User className={`h-4 w-4 ${
                    status === 'pending' ? 'text-yellow-600' :
                    status === 'approved' ? 'text-green-600' :
                    status === 'rejected' ? 'text-red-600' : 'text-blue-600'
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search providers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Providers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedProviders.length === filteredProviders.length && filteredProviders.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Jobs</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProviders.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedProviders.includes(provider.id)}
                      onCheckedChange={(checked) => handleProviderSelect(provider.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={provider.documents.profilePhoto} />
                        <AvatarFallback>{provider.fullName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{provider.fullName}</p>
                        <p className="text-sm text-muted-foreground">{provider.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{provider.specialization}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {provider.serviceCategories.slice(0, 2).map((category) => (
                          <Badge key={category} variant="secondary" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                        {provider.serviceCategories.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{provider.serviceCategories.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(provider.status)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{new Date(provider.submittedAt).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">{new Date(provider.submittedAt).toLocaleTimeString()}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {provider.status === 'approved' ? (
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium">{provider.rating}</span>
                        <span className="text-yellow-500">★</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {provider.status === 'approved' ? provider.totalJobs : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Provider Details</DialogTitle>
                              <DialogDescription>
                                Complete information for {provider.fullName}
                              </DialogDescription>
                            </DialogHeader>
                            <ProviderDetailView provider={provider} onDownload={downloadDocument} />
                          </DialogContent>
                        </Dialog>
                        {provider.status === 'pending' && (
                          <>
                            <DropdownMenuItem onClick={() => handleReviewProvider(provider, 'approve')}>
                              <Check className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReviewProvider(provider, 'reject')}>
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve Provider' : 'Reject Provider'}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve' 
                ? `Approve ${selectedProvider?.fullName} as a service provider?`
                : `Reject ${selectedProvider?.fullName}'s application?`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {reviewAction === 'reject' && (
              <div className="space-y-2">
                <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  rows={3}
                />
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitReview}
                variant={reviewAction === 'approve' ? 'default' : 'destructive'}
                disabled={reviewAction === 'reject' && !rejectionReason.trim()}
              >
                {reviewAction === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ProviderDetailView: React.FC<{ provider: Provider; onDownload: (url: string, filename: string) => void }> = ({ 
  provider, 
  onDownload 
}) => {
  return (
    <Tabs defaultValue="personal" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="personal">Personal</TabsTrigger>
        <TabsTrigger value="business">Business</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="performance">Performance</TabsTrigger>
      </TabsList>
      
      <TabsContent value="personal" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={provider.documents.profilePhoto} />
                <AvatarFallback>{provider.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{provider.fullName}</h3>
                <p className="text-muted-foreground">{provider.email}</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                <p>{provider.phoneNumber}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <div className="mt-1">
                  {provider.status === 'pending' && <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Pending</Badge>}
                  {provider.status === 'approved' && <Badge variant="outline" className="bg-green-50 text-green-700">Approved</Badge>}
                  {provider.status === 'rejected' && <Badge variant="outline" className="bg-red-50 text-red-700">Rejected</Badge>}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Submitted</Label>
                <p>{new Date(provider.submittedAt).toLocaleString()}</p>
              </div>
              {provider.reviewedAt && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Reviewed</Label>
                  <p>{new Date(provider.reviewedAt).toLocaleString()}</p>
                </div>
              )}
            </div>
            {provider.rejectionReason && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Rejection Reason</Label>
                <p className="text-red-600">{provider.rejectionReason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="business" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Business Name</Label>
                <p>{provider.businessInfo.businessName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Business Type</Label>
                <p className="capitalize">{provider.businessInfo.businessType}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Specialization</Label>
                <p>{provider.specialization}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Experience</Label>
                <p className="capitalize">{provider.businessInfo.experience}</p>
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-muted-foreground">Service Area</Label>
                <p>{provider.businessInfo.serviceArea}</p>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Service Categories</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {provider.serviceCategories.map((category) => (
                  <Badge key={category} variant="secondary">{category}</Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Bio</Label>
              <p className="mt-1">{provider.businessInfo.bio}</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="documents" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(provider.documents).map(([key, filename]) => {
                if (!filename) return null;
                const documentNames: Record<string, string> = {
                  profilePhoto: 'Profile Photo',
                  nationalId: 'National ID',
                  commercialRegistration: 'Commercial Registration',
                  businessLicense: 'Business License',
                  insurance: 'Insurance Certificate',
                  taxCertificate: 'Tax Certificate',
                };
                
                return (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{documentNames[key]}</p>
                        <p className="text-sm text-muted-foreground">{filename}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onDownload(filename, documentNames[key])}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="performance" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rating</p>
                  <p className="text-2xl font-bold">{provider.rating || 'N/A'}</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-full">
                  <span className="text-yellow-600">★</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                  <p className="text-2xl font-bold">{provider.totalJobs}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Earnings</p>
                  <p className="text-2xl font-bold">${provider.earnings}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
};