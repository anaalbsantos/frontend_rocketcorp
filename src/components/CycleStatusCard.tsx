import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { ChevronRight, FilePen } from "lucide-react";
import * as React from "react";

const cardVariants = cva(
  "flex items-center justify-between rounded-lg bg-white p-5 transition-colors hover:opacity-80 hover:border-transparent",
  {
    variants: {
      variant: {
        default: "bg-brand text-white",
        soon: "bg-white text-[#565656] disabled:pointer-events-none",
        results: "bg-white text-brand",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type CycleStatusCardProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "soon" | "results";
  title: string;
  description: string;
};

const CycleStatusCard = React.forwardRef<
  HTMLButtonElement,
  CycleStatusCardProps
>(({ variant = "default", title, description, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(cardVariants({ variant }), className)}
      type="button"
      disabled={variant === "soon"}
      {...(variant === "soon" && { "aria-disabled": true })}
      {...props}
    >
      <div className="flex items-center gap-4">
        <FilePen size={40} />
        <div className="flex flex-col text-start ">
          <p className="font-bold text-lg">{title}</p>
          <p className="text-xs">{description}</p>
        </div>
      </div>
      <div
        className={`flex items-center justify-center w-10 h-10 rounded-full ${
          variant === "default"
            ? "bg-brand"
            : variant === "soon"
            ? "bg-[#565656]"
            : "bg-brand"
        }`}
      >
        <ChevronRight className="text-white" />
      </div>
    </button>
  );
});

CycleStatusCard.displayName = "CycleStatusCard";

export default CycleStatusCard;
