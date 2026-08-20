import { Zap, Route, Droplets, HeartPulse, GraduationCap, Mountain } from "@/lib/icons";

interface SectorIconProps {
  iconKey: string;
  className?: string;
}

export function SectorIcon({ iconKey, className = "size-5" }: SectorIconProps) {
  const IconComponent = {
    Zap,
    Route,
    Droplets,
    HeartPulse,
    GraduationCap,
    Mountain
  }[iconKey] || Mountain;

  return (
    <div className={`flex items-center justify-center rounded-md bg-primary-50 text-primary-600 p-2 ${className}`}>
      <IconComponent className="size-full" />
    </div>
  );
}
