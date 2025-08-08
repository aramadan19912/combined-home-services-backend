import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Paperclip, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { complaintsApi } from "@/services/api";

interface MyComplaint {
  id: string;
  subject: string;
  description: string;
  category?: string;
  status: string;
  createdAt: string;
  attachments?: { fileName: string }[];
}

const statusVariant = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("resolve")) return "secondary" as const;
  if (s.includes("progress") || s.includes("investigat")) return "outline" as const;
  if (s.includes("escalat")) return "destructive" as const;
  return "default" as const;
};

const CustomerComplaints = () => {
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("service-quality");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [attachments, setAttachments] = useState<{ fileName: string }[]>([]);

  const [loading, setLoading] = useState(true);
  const [myComplaints, setMyComplaints] = useState<MyComplaint[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "My Complaints | ServiceHub";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Submit and track your complaints, upload attachments, and view status updates.");
  }, []);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const data = await complaintsApi.getMyComplaints();
      setMyComplaints(data as any);
    } catch (e) {
      setError("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files;
    if (!f) return;
    // Validate size/type
    const validTypes = ["application/pdf", "image/jpeg", "image/png"]; 
    for (const file of Array.from(f)) {
      if (!validTypes.includes(file.type) || file.size > 10 * 1024 * 1024) {
        toast({ title: "Invalid file", description: "Only PDF/JPG/PNG up to 10MB", variant: "destructive" });
        return;
      }
    }
    setFiles(f);
  };

  const uploadSelectedFiles = async (): Promise<{ fileName: string }[]> => {
    if (!files || files.length === 0) return [];
    setUploading(true);
    try {
      const uploaded: { fileName: string }[] = [];
      await Promise.all(Array.from(files).map(async (file) => {
        const res = await complaintsApi.uploadAttachment(file);
        const name = (res as any).fileName || (res as any).name || file.name;
        uploaded.push({ fileName: name });
      }));
      setAttachments(uploaded);
      return uploaded;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast({ title: "Missing fields", description: "Subject and description are required.", variant: "destructive" });
      return;
    }

    try {
      setCreating(true);
      const uploaded = await uploadSelectedFiles();
      await complaintsApi.createComplaint({
        subject,
        description,
        category,
        attachments: uploaded.map((a) => a.fileName),
      } as any);
      toast({ title: "Complaint submitted", description: "We'll update you as we investigate." });
      setSubject("");
      setDescription("");
      setFiles(null);
      setAttachments([]);
      await loadComplaints();
    } catch (e) {
      toast({ title: "Submission failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (fileName: string) => {
    try {
      const blob = await complaintsApi.downloadAttachment(fileName);
      const url = URL.createObjectURL(blob as any);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast({ title: "Download failed", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userType="customer" />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Complaints</h1>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit a complaint</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Subject</label>
                      <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief summary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="service-quality">Service quality</SelectItem>
                          <SelectItem value="billing">Billing</SelectItem>
                          <SelectItem value="communication">Communication</SelectItem>
                          <SelectItem value="scheduling">Scheduling</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue..." className="min-h-28" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Attachments (PDF/JPG/PNG up to 10MB)</label>
                    <Input type="file" multiple accept="application/pdf,image/jpeg,image/png" onChange={handleFileChange} />
                    {attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {attachments.map((a) => (
                          <div key={a.fileName} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Paperclip className="h-4 w-4" />
                              <span className="truncate max-w-[240px]">{a.fileName}</span>
                            </div>
                            <Button type="button" size="sm" variant="ghost" onClick={() => handleDownload(a.fileName)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={creating || uploading}>
                      {(creating || uploading) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Submit Complaint
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>My complaints</CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>
                )}
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : myComplaints.length === 0 ? (
                  <p className="text-muted-foreground">No complaints yet.</p>
                ) : (
                  <div className="space-y-4">
                    {myComplaints.map((c) => (
                      <div key={c.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{c.subject}</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <span>{new Date(c.createdAt).toLocaleString()}</span>
                              {c.category && (
                                <span className="inline-flex items-center gap-1">
                                  <span>Category:</span>
                                  <Badge variant="outline">{c.category}</Badge>
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
                        </div>
                        {c.attachments && c.attachments.length > 0 && (
                          <div className="mt-3 space-y-1">
                            {c.attachments.map((a) => (
                              <button key={a.fileName} onClick={() => handleDownload(a.fileName)} className="text-sm flex items-center gap-2 hover:underline">
                                <Paperclip className="h-4 w-4" /> {a.fileName}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>Provide as much detail as possible to help us resolve your issue quickly.</p>
                <p>Attach clear evidence (photos, receipts) if applicable.</p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default CustomerComplaints;
