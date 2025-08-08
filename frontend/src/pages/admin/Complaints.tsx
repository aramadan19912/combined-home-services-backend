import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Send, Filter, UserCheck, ArrowUpRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { complaintsApi } from "@/services/api";

interface AdminComplaint {
  id: string;
  subject: string;
  description: string;
  category?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  customer?: { name?: string; email?: string };
  provider?: { name?: string };
  attachments?: { fileName: string }[];
}

const statusList = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "escalated", label: "Escalated" },
];

const AdminComplaints = () => {
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<AdminComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState<AdminComplaint | null>(null);
  const [reply, setReply] = useState("");
  const [assignId, setAssignId] = useState("");
  const [escalateReason, setEscalateReason] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    document.title = "Admin Complaints | ServiceHub";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Manage customer complaints: filter, assign, reply, escalate, and view audit logs.");
  }, []);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const data = await complaintsApi.admin.getComplaints();
      setComplaints(data as any);
      if (data && (data as any[]).length > 0) setSelected((data as any)[0]);
    } catch (e) {
      setError("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadComplaints(); }, []);

  const filtered = useMemo(() => {
    if (filterStatus === 'all') return complaints;
    return complaints.filter(c => c.status?.toLowerCase().includes(filterStatus.replace('_','-')));
  }, [complaints, filterStatus]);

  const handleReply = async () => {
    if (!selected || !reply.trim()) return;
    setSending(true);
    try {
      await complaintsApi.admin.reply(selected.id, { message: reply } as any);
      toast({ title: "Reply sent" });
      setReply("");
    } catch (e) {
      toast({ title: "Failed to send reply", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleAssign = async () => {
    if (!selected || !assignId.trim()) return;
    setSending(true);
    try {
      await complaintsApi.admin.assign(selected.id, assignId);
      toast({ title: "Assigned" });
      setAssignId("");
    } catch (e) {
      toast({ title: "Failed to assign", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleEscalate = async () => {
    if (!selected || !escalateReason.trim()) return;
    setSending(true);
    try {
      await complaintsApi.admin.escalate(selected.id, escalateReason);
      toast({ title: "Escalated" });
      setEscalateReason("");
    } catch (e) {
      toast({ title: "Escalation failed", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const loadAudit = async (id: string) => {
    try {
      const logs = await complaintsApi.admin.getAuditLogs(id);
      return (logs as any[]).map((l) => ({ when: new Date(l.timestamp || l.when || Date.now()).toLocaleString(), action: l.action || l.status || 'Updated', by: l.by || 'system' }));
    } catch {
      return [] as any[];
    }
  };

  const [audit, setAudit] = useState<{ when: string; action: string; by: string }[]>([]);
  useEffect(() => {
    (async () => { if (selected) setAudit(await loadAudit(selected.id)); })();
  }, [selected?.id]);

  return (
    <div className="min-h-screen bg-background">
      <Header userType="admin" />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Complaints</h1>
          <div className="flex items-center gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter status" /></SelectTrigger>
              <SelectContent>
                {statusList.map(s => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadComplaints}><Filter className="h-4 w-4 mr-2" />Refresh</Button>
          </div>
        </div>

        {error && (<Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>)}

        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (<div key={i} className="h-16 bg-muted animate-pulse rounded" />))}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-3">
              {filtered.map((c) => (
                <button key={c.id} onClick={() => setSelected(c)} className={`w-full text-left p-4 border rounded-lg hover:bg-muted transition ${selected?.id===c.id? 'ring-2 ring-primary':''}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate max-w-[70%]">{c.subject}</span>
                    <Badge variant={c.status?.includes('resolve')? 'secondary':'outline'}>{c.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>
                </button>
              ))}
            </div>

            <div className="lg:col-span-2 space-y-6">
              {selected ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{selected.subject}</span>
                        <Badge variant={selected.status?.includes('resolve')? 'secondary':'outline'}>{selected.status}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">{selected.description}</p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Customer</p>
                          <p className="text-muted-foreground">{selected.customer?.name || selected.customer?.email || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="font-medium">Provider</p>
                          <p className="text-muted-foreground">{selected.provider?.name || 'N/A'}</p>
                        </div>
                      </div>

                      {selected.attachments && selected.attachments.length > 0 && (
                        <div className="pt-2">
                          <p className="font-medium mb-2">Attachments</p>
                          <div className="flex flex-wrap gap-2 text-sm">
                            {selected.attachments.map((a) => (
                              <Button key={a.fileName} size="sm" variant="outline" onClick={async ()=>{
                                try { const blob=await complaintsApi.downloadAttachment(a.fileName); const url=URL.createObjectURL(blob as any); const link=document.createElement('a'); link.href=url; link.download=a.fileName; link.click(); URL.revokeObjectURL(url);} catch {}
                              }}>
                                {a.fileName}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Assign to admin (ID)</label>
                          <div className="flex gap-2 mt-2">
                            <Input value={assignId} onChange={(e)=>setAssignId(e.target.value)} placeholder="admin-id" />
                            <Button onClick={handleAssign} disabled={sending}><UserCheck className="h-4 w-4 mr-2"/>Assign</Button>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Escalate with reason</label>
                          <div className="flex gap-2 mt-2">
                            <Input value={escalateReason} onChange={(e)=>setEscalateReason(e.target.value)} placeholder="Reason" />
                            <Button variant="destructive" onClick={handleEscalate} disabled={sending}><ArrowUpRight className="h-4 w-4 mr-2"/>Escalate</Button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Reply</label>
                        <div className="flex gap-2 mt-2">
                          <Textarea value={reply} onChange={(e)=>setReply(e.target.value)} placeholder="Type a message to customer" />
                          <Button onClick={handleReply} disabled={sending || !reply.trim()}><Send className="h-4 w-4 mr-2"/>Send</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Audit log</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {audit.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No audit logs.</p>
                      ) : (
                        <div className="space-y-2">
                          {audit.map((l, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm p-2 border rounded">
                              <span>{l.action}</span>
                              <span className="text-muted-foreground">{l.when} • {l.by}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card><CardContent className="h-64 flex items-center justify-center text-muted-foreground">Select a complaint</CardContent></Card>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminComplaints;
