"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, PlusCircle, ClipboardList, BarChart3, FileSearch } from "lucide-react";
import type { DemoUser } from "@/lib/auth";

interface InternalNavProps {
  user: DemoUser;
}

export function OfficerNav({ user }: InternalNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const sector = user.sector ?? "";

  const links = [
    { href: `/officer/${sector}`, label: "My Updates", icon: LayoutDashboard },
    { href: `/officer/${sector}/submit`, label: "Submit Update", icon: PlusCircle },
  ];

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  }

  return (
    <header className="bg-[#1e3a5f] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-bold text-base flex items-center gap-2">
              <span>🏛️</span>
              <span className="hidden sm:block">Lira District</span>
            </Link>
            <nav className="flex items-center gap-1">
              {links.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors",
                    pathname === href || pathname.startsWith(href + "/")
                      ? "bg-white/20 text-white font-medium"
                      : "text-blue-100 hover:text-white hover:bg-white/10"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:block">{label}</span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-blue-200 hidden sm:block">
              {user.name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-blue-100 hover:text-white hover:bg-white/10 gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Sign out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export function AdminNav({ user }: InternalNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/review", label: "Review Queue", icon: ClipboardList },
    { href: "/admin/search", label: "Search", icon: FileSearch },
    { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  ];

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  }

  return (
    <header className="bg-[#1e3a5f] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-bold text-base flex items-center gap-2">
              <span>🏛️</span>
              <span className="hidden sm:block">Lira District Admin</span>
            </Link>
            <nav className="flex items-center gap-1">
              {links.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors",
                    pathname === href
                      ? "bg-white/20 text-white font-medium"
                      : "text-blue-100 hover:text-white hover:bg-white/10"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:block">{label}</span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-blue-200 hidden sm:block">{user.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-blue-100 hover:text-white hover:bg-white/10 gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Sign out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
