"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, ExclamationTriangle, ArrowPath } from "@/lib/icons";

export function ReviewActions({ updateId }: { updateId: string }) {
  const router = useRouter();
  const [action, setAction] = useState<"approve" | "reject" | "needs_correction" | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!action) return;
    if ((action === "reject" || action === "needs_correction") && !comment.trim()) {
      setError("A comment is required when rejecting or requesting correction.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/updates/${updateId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, comment: comment.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        router.refresh();
        router.push("/admin/review");
      } else {
        setError(data.error ?? "Failed to submit review.");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-2 border-blue-100">
      <CardHeader>
        <CardTitle className="text-base">Review Decision</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => setAction("approve")}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
              action === "approve"
                ? "border-green-500 bg-secondary-50 text-secondary-800"
                : "border-border-default hover:border-green-300 text-text-default"
            }`}
          >
            <CheckCircle className="w-4 h-4 text-green-600" />
            Approve & Publish
          </button>
          <button
            type="button"
            onClick={() => setAction("needs_correction")}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
              action === "needs_correction"
                ? "border-amber-500 bg-amber-50 text-amber-800"
                : "border-border-default hover:border-amber-300 text-text-default"
            }`}
          >
            <ExclamationTriangle className="w-4 h-4 text-amber-600" />
            Request Correction
          </button>
          <button
            type="button"
            onClick={() => setAction("reject")}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
              action === "reject"
                ? "border-red-500 bg-error-50 text-error-800"
                : "border-border-default hover:border-red-300 text-text-default"
            }`}
          >
            <XCircle className="w-4 h-4 text-red-600" />
            Reject
          </button>
        </div>

        {action && (
          <div className="space-y-1.5">
            <Label htmlFor="comment">
              Comment{" "}
              {(action === "reject" || action === "needs_correction") && (
                <span className="text-red-600">*</span>
              )}
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                action === "approve"
                  ? "Optional note for the record…"
                  : "Explain what needs to be changed or why this is rejected…"
              }
              rows={3}
            />
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-error-50 border border-error-200 rounded px-3 py-2">
            {error}
          </p>
        )}

        <Button
          onClick={submit}
          disabled={!action || loading}
          className="w-full"
          variant={
            action === "approve"
              ? "success"
              : action === "reject"
              ? "destructive"
              : "warning"
          }
        >
          {loading ? (
            <ArrowPath className="w-4 h-4 animate-spin" />
          ) : action === "approve" ? (
            "Approve & Publish"
          ) : action === "needs_correction" ? (
            "Request Correction"
          ) : action === "reject" ? (
            "Reject Update"
          ) : (
            "Select an action"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
