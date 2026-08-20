"use client";
import { Header } from "@/components/Header";
import { LayoutDashboard, CirclePlus, ClipboardList, ChartBar, FileSearch } from "@/lib/icons";
import type { DemoUser } from "@/lib/auth";

interface InternalNavProps {
  user: DemoUser;
}

export function OfficerNav({ user }: InternalNavProps) {
  const sector = user.sector ?? "";
  
  return (
    <Header
      kind="officer"
      user={user}
      navItems={[
        { href: `/officer/${sector}`, label: "My Updates", icon: LayoutDashboard },
        { href: `/officer/${sector}/submit`, label: "Submit Update", icon: CirclePlus },
      ]}
    />
  );
}

export function AdminNav({ user }: InternalNavProps) {
  return (
    <Header
      kind="admin"
      user={user}
      navItems={[
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/review", label: "Review Queue", icon: ClipboardList },
        { href: "/admin/search", label: "Search", icon: FileSearch },
        { href: "/admin/reports", label: "Reports", icon: ChartBar },
      ]}
    />
  );
}
