import { PublicHeader } from "@/components/PublicHeader";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <footer className="bg-[#1e3a5f] text-blue-200 text-center py-4 text-sm mt-auto">
        <p>&copy; {new Date().getFullYear()} Lira District Local Government. All rights reserved.</p>
      </footer>
    </div>
  );
}
