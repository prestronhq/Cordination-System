"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeSlash, ArrowRightOnRectangle } from "@/lib/icons";
import Image from "next/image";

const DEMO_ACCOUNTS = [
  { label: "District Administrator", username: "admin", password: "admin123" },
  { label: "Electricity Officer", username: "electricity.officer", password: "demo123" },
  { label: "Roads Officer", username: "roads.officer", password: "demo123" },
  { label: "Water Officer", username: "water.officer", password: "demo123" },
  { label: "Health Officer", username: "health.officer", password: "demo123" },
  { label: "Education Officer", username: "education.officer", password: "demo123" },
  { label: "Land Officer", username: "land.officer", password: "demo123" },
];

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.redirectTo) {
        router.push(data.redirectTo);
      } else {
        setError(data.error ?? "Invalid username or password.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(username: string, password: string) {
    setUsername(username);
    setPassword(password);
    setError("");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-inverse to-primary-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <Image src="/logo.png" alt="Lira District Logo" width={64} height={64} />
          </div>
          <h1 className="text-display font-serif text-white">Lira District</h1>
          <p className="text-text-on-inverse-muted text-small mt-1">Sign in to access your portal</p>
        </div>

        <Card className="shadow-lg border-none">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <ArrowRightOnRectangle className="size-5" />
              Sign In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  autoComplete="username"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text-default"
                  >
                    {showPassword ? <EyeSlash className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-error-50 border border-error-200 text-error-700 text-sm rounded-md px-3 py-2">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in…" : "Sign In"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link href="/" className="text-sm text-primary-600 hover:underline font-medium">
                ← Back to public site
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Demo accounts panel */}
        <div className="mt-6">
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-warning-800">Demo Accounts</span>
              <span className="text-[10px] font-bold bg-warning-200 text-warning-800 px-1.5 py-0.5 rounded tracking-wider">DEMO ONLY</span>
            </div>
            <div className="space-y-1">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => fillDemo(acc.username, acc.password)}
                  className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-warning-100 transition-colors flex justify-between items-center group"
                >
                  <span className="text-warning-900 font-medium">{acc.label}</span>
                  <span className="text-warning-600 font-mono text-xs opacity-70 group-hover:opacity-100">
                    {acc.username}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-caption text-warning-700 mt-3 text-center">
              Click any account above to auto-fill credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
