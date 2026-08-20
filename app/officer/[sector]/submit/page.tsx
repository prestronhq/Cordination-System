"use client";
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ACTIVE_SECTORS, getSectorConfig } from "@/lib/sectors";
import { ArrowLeft, Send } from "@/lib/icons";
import Link from "next/link";

export default function SubmitUpdatePage({
  params,
}: {
  params: Promise<{ sector: string }>;
}) {
  const { sector } = use(params);
  const sectorConfig = getSectorConfig(sector);
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    priority: "medium",
  });
  const [sectorFields, setSectorFields] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!sectorConfig) {
    return <div className="p-8 text-center text-text-muted">Unknown sector.</div>;
  }

  function handleChange(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSectorField(key: string, value: string) {
    setSectorFields((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          sectorKey: sector,
          sectorFields,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/officer/${sector}/update/${data.id}`);
      } else {
        setError(data.error ?? "Failed to submit. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/officer/${sector}`}
          className="flex items-center gap-1 text-sm text-text-muted hover:text-text-strong mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to my updates
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{sectorConfig.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-text-strong">Submit New Update</h1>
            <p className="text-text-muted text-sm">{sectorConfig.name} Sector</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Update Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Brief descriptive title"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Provide full details of the update..."
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={form.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="Sub-county, parish, village, or road name"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sector-specific fields */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {sectorConfig.name}-Specific Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sectorConfig.fields.map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <Label htmlFor={field.key}>
                      {field.label} {field.required && "*"}
                    </Label>
                    {field.type === "select" && field.options ? (
                      <Select
                        value={sectorFields[field.key] ?? ""}
                        onValueChange={(val) => handleSectorField(field.key, val)}
                        required={field.required}
                      >
                        <SelectTrigger id={field.key}>
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.type === "number" ? (
                      <Input
                        id={field.key}
                        type="number"
                        min="0"
                        value={sectorFields[field.key] ?? ""}
                        onChange={(e) => handleSectorField(field.key, e.target.value)}
                        placeholder="Enter number"
                        required={field.required}
                      />
                    ) : field.type === "date" ? (
                      <Input
                        id={field.key}
                        type="date"
                        value={sectorFields[field.key] ?? ""}
                        onChange={(e) => handleSectorField(field.key, e.target.value)}
                        required={field.required}
                      />
                    ) : (
                      <Input
                        id={field.key}
                        value={sectorFields[field.key] ?? ""}
                        onChange={(e) => handleSectorField(field.key, e.target.value)}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={form.priority}
                  onValueChange={(val) => handleChange("priority", val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-text-muted mt-2">
                  Set High for urgent issues requiring immediate attention.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-primary-50 border-primary-200">
              <CardContent className="p-4">
                <p className="text-xs text-primary-800 leading-relaxed">
                  <strong>Attachments:</strong> Document uploads are not yet available in this version. 
                  Reference supporting documents in your description.
                </p>
              </CardContent>
            </Card>

            {error && (
              <div className="bg-error-50 border border-error-200 text-error-700 text-sm rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              <Send className="w-4 h-4" />
              {submitting ? "Submitting…" : "Submit for Review"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
