"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FloatingInput({
  label,
  value,
  error,
  className,
  ...props
}: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const active = isFocused || (value && String(value).length > 0);

  return (
    <div className="relative w-full">
      <Input
        {...props}
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "h-12 w-full rounded-lg bg-[#111] border border-gray-700 text-white px-3 pt-4 pb-1 placeholder-transparent",
          error && "border-red-500",
          className
        )}
      />

      {/* Floating Label */}
      <label
        className={cn(
          "absolute left-3 pointer-events-none text-gray-400 transition-all duration-200",
          active ? "top-1 text-[11px]" : "top-3.5 text-sm"
        )}
      >
        {label}
      </label>

      {/* Error Message */}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
