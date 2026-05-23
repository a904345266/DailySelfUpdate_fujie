import { AuthGuard } from '@/components/AuthGuard';
import { DashboardNav } from '@/components/layout/DashboardNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen app-gradient">
        <DashboardNav />
        <div className="animate-fade-in">{children}</div>
      </div>
    </AuthGuard>
  );
}
