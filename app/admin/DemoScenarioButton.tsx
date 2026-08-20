"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CirclePlay, LoaderCircle } from "@/lib/icons";

export function DemoScenarioButton() {
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function runDemo() {
    setRunning(true);
    setMessage("Running demo scenario…");
    try {
      const res = await fetch("/api/demo/run", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message ?? "Demo scenario complete!");
        setTimeout(() => {
          setMessage("");
          router.refresh();
        }, 2500);
      } else {
        setMessage(data.error ?? "Error running demo.");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch {
      setMessage("Something went wrong.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {message && (
        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
          {message}
        </span>
      )}
      <Button variant="outline" onClick={runDemo} disabled={running} className="gap-1.5">
        {running ? (
          <LoaderCircle className="w-4 h-4 animate-spin" />
        ) : (
          <CirclePlay className="w-4 h-4 text-green-600" />
        )}
        Run Demo Scenario
      </Button>
    </div>
  );
}
