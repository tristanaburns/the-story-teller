import MainNav from '@/components/ui/MainNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white">
      <MainNav />
      <main className="flex-grow">{children}</main>
      <footer className="bg-gray-900 border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400">
            © {new Date().getFullYear()} The Story Teller. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}