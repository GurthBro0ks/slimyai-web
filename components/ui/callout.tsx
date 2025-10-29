import * as React from "react";
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const icons = {
  success: CheckCircle,
  warn: AlertCircle,
  error: XCircle,
  info: Info,
};

const variants = {
  success: "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400",
  warn: "border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  error: "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400",
  info: "border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

interface CalloutProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variants;
  icon?: boolean;
}

export function Callout({
  variant = "info",
  icon = true,
  className,
  children,
  ...props
}: CalloutProps) {
  const Icon = icons[variant];

  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border p-4",
        variants[variant],
        className
      )}
      {...props}
    >
      {icon && <Icon className="h-5 w-5 shrink-0" />}
      <div className="flex-1">{children}</div>
    </div>
  );
}
