import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        default: "bg-slate-100 text-slate-800",
        secondary: "bg-blue-50 text-blue-700",
        destructive: "bg-red-50 text-red-700 border border-red-200",
        outline: "text-slate-800 border border-slate-200 bg-white",
        // Semantic template status pills
        draft: "bg-slate-100 text-slate-700",
        pending: "bg-amber-50 text-amber-800 border border-amber-200",
        confirmed: "bg-blue-50 text-blue-700 border border-blue-200",
        ongoing: "bg-indigo-50 text-indigo-700 border border-indigo-200",
        completed: "bg-emerald-50 text-emerald-800 border border-emerald-200",
        cancelled: "bg-red-50 text-red-800 border border-red-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  pulse?: boolean;
}

function Badge({ className, variant, dot = true, pulse = false, children, ...props }: BadgeProps) {
  const getDotColor = () => {
    switch (variant) {
      case 'ongoing':
        return 'bg-indigo-600';
      case 'confirmed':
        return 'bg-blue-600';
      case 'pending':
        return 'bg-amber-500';
      case 'completed':
        return 'bg-emerald-600';
      case 'cancelled':
        return 'bg-red-600';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            getDotColor(),
            (pulse || variant === 'ongoing') && "animate-pulse"
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
