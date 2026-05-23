import Link from 'next/link';
import { NotebookPen } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col app-gradient px-4 py-8">
      <div className="mx-auto flex w-full max-w-md items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-sm">
            <NotebookPen className="h-5 w-5" />
          </div>
          <span className="text-base font-bold tracking-tight">
            Daily<span className="text-gradient">SelfUpdate</span>
          </span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md animate-rise">{children}</div>
      </div>
    </div>
  );
}
