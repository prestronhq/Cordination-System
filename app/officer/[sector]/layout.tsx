import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { OfficerNav } from "@/components/InternalNav";

export default async function OfficerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ sector: string }>;
}) {
  const { sector } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }
  if (user.role !== "officer" || user.sector !== sector) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <OfficerNav user={user} />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  );
}
