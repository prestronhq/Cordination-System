import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/lib/sectors";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusVariants: Record<string, "pending" | "success" | "destructive" | "warning" | "secondary"> = {
  pending: "pending",
  approved: "success",
  rejected: "destructive",
  needs_correction: "warning",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = statusVariants[status] ?? "secondary";
  const label = STATUS_LABELS[status] ?? status;
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

const priorityVariants: Record<string, "destructive" | "warning" | "secondary"> = {
  high: "destructive",
  medium: "warning",
  low: "secondary",
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const variant = priorityVariants[priority] ?? "secondary";
  return (
    <Badge variant={variant} className={className}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
    </Badge>
  );
}
