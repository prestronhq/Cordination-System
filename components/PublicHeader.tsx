import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PublicHeader() {
  return (
    <header className="bg-[#1e3a5f] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
              <span className="text-xl">🏛️</span>
            </div>
            <div>
              <div className="font-bold text-base leading-tight">Lira District</div>
              <div className="text-xs text-blue-200 leading-tight">Sector Coordination Platform</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/" className="text-blue-100 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/bulletin" className="text-blue-100 hover:text-white transition-colors">
              Public Bulletin
            </Link>
          </nav>

          <Button
            asChild
            className="bg-white text-[#1e3a5f] hover:bg-blue-50 font-semibold text-sm"
          >
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
