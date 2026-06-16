"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Checkbox                                                           */
/*  Figma: 24×24, rounded-8                                           */
/*  Selected=False: outline on-surface-tertiary, white fill            */
/*  Selected=True: bg interactive-primary, white check icon            */
/*  Disabled: outline/fill uses surface-disabled color                 */
/*  Optional label text, gap-8                                         */
/* ------------------------------------------------------------------ */

export interface CheckboxProps {
  checked?: boolean;
  disabled?: boolean;
  label?: string;
  size?: "small" | "medium";
  onChange?: (checked: boolean) => void;
  className?: string;
}

export function Checkbox({
  checked = false,
  disabled = false,
  label,
  size = "medium",
  onChange,
  className,
}: CheckboxProps) {
  const isSmall = size === "small";
  return (
    <label
      className={cn(
        "inline-flex items-center",
        isSmall ? "gap-8" : "gap-8",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        className
      )}
    >
      <button
        role="checkbox"
        aria-checked={checked}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={() => !disabled && onChange?.(!checked)}
        className={cn(
          "relative flex shrink-0 items-center justify-center transition-colors",
          isSmall ? "h-20 w-20 rounded-4" : "h-24 w-24 rounded-8",
          checked
            ? disabled
              ? "bg-border-primary"
              : "bg-interactive-primary"
            : disabled
              ? "border-[1.5px] border-border-primary bg-surface-primary"
              : "border-2 border-on-surface-primary bg-surface-primary"
        )}
      >
        {checked && (
          <Check
            className={isSmall ? "h-12 w-12 text-interactive-contrast" : "h-12 w-12 text-interactive-contrast"}
            strokeWidth={2.5}
          />
        )}
      </button>
      {label && (
        <span
          className={cn(
            isSmall
              ? "text-[12px] leading-[17px] tracking-[-0.004em]"
              : "text-[14px] leading-[20px] tracking-[-0.006em]",
            disabled ? "text-on-surface-tertiary" : "text-on-surface-primary"
          )}
        >
          {label}
        </span>
      )}
    </label>
  );
}
