import { Header } from "@/components/layout/Header";
import { ProviderManagement } from "@/components/admin/ProviderManagement";

const AdminProviders = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header userType="admin" />
      <main className="container mx-auto px-4 py-8">
        <ProviderManagement />
      </main>
    </div>
  );
};

export default AdminProviders;
