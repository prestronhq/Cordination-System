"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRightEndOnRectangle } from "@/lib/icons";
import Image from "next/image";

interface HeaderProps {
  kind: "public" | "officer" | "admin";
  navItems?: { href: string; label: string; icon?: React.ElementType }[];
  user?: { name: string; role: string; sector?: string | null };
}

export function Header({ kind, navItems = [], user }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  }

  const isPublic = kind === "public";
  const homeLink = isPublic ? "/" : kind === "officer" ? `/officer/${user?.sector}` : "/admin";

  return (
    <header className="bg-surface-inverse text-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href={homeLink} className="flex items-center gap-2">
            <Image src="/logo.png" alt="Lira District Logo" width={32} height={32} />
            <div className="font-serif font-bold leading-tight">
              Lira District
              {!isPublic && <span className="ml-2 font-sans text-xs font-medium text-primary-100 opacity-80">{kind === "admin" ? "Admin" : "Officer"}</span>}
            </div>
          </Link>
          
          {navItems.length > 0 && (
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-text-on-inverse-muted hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {item.icon && <item.icon className="size-4" />}
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-text-on-inverse-muted hidden sm:block">{user.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-text-on-inverse-muted hover:bg-white/5 hover:text-white gap-1.5"
              >
                <ArrowRightEndOnRectangle className="size-4" />
                <span className="hidden sm:block">Sign out</span>
              </Button>
            </div>
          )}

          {isPublic && (
            <Button asChild className="bg-primary-600 text-white hover:bg-primary-700">
              <Link href="/login">Staff Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
