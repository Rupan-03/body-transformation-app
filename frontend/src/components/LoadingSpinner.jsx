// src/components/LoadingSpinner.jsx
import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Reusable loading indicator.
 *
 * Props:
 * - label?: string              // text next to spinner (default: "Loading…")
 * - size?: "sm" | "md" | "lg"   // spinner size (default: "md")
 * - fullScreen?: boolean        // centers in a tall box (default: false)
 * - inline?: boolean            // inline spinner (default: false)
 * - className?: string          // extra wrapper classes
 */
export default function LoadingSpinner({
  label = "Loading…",
  size = "md",
  fullScreen = false,
  inline = false,
  className = "",
}) {
  const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" };

  const content = (
    <div className={`flex items-center gap-3 ${inline ? "" : "py-4"}`}>
      <Loader2 className={`animate-spin ${sizes[size]} text-blue-600`} />
      {label ? <span className="text-sm text-slate-600">{label}</span> : null}
    </div>
  );

  if (fullScreen && !inline) {
    return (
      <div
        className={`w-full min-h-[200px] flex items-center justify-center ${className}`}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        {content}
      </div>
    );
  }

  return (
    <div className={className} role="status" aria-live="polite" aria-busy="true">
      {content}
    </div>
  );
}
