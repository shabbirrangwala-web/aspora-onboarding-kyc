"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "@/components/ui/navbar";
import { StandardButton } from "@/components/ui/button";

interface KYCShellProps {
  title: string;
  step: number;
  totalSteps?: number;
  showBack?: boolean;
  onBack?: () => void;
  cta?: string;
  onCta?: () => void;
  ctaDisabled?: boolean;
  ctaLoading?: boolean;
  secondaryCta?: React.ReactNode;
  children: React.ReactNode;
}

export function KYCShell({
  title,
  step,
  totalSteps = 13,
  showBack = true,
  onBack,
  cta = "Continue",
  onCta,
  ctaDisabled,
  ctaLoading,
  secondaryCta,
  children,
}: KYCShellProps) {
  const router = useRouter();
  const progress = Math.min((step / totalSteps) * 100, 100);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-surface-primary">
      <Navbar
        title={title}
        showLeading={showBack}
        onLeadingPress={onBack ?? (() => router.back())}
        showDivider={false}
      />

      {/* Progress bar */}
      <div className="px-16 pb-4">
        <div className="h-[3px] w-full overflow-hidden rounded-full bg-surface-tertiary">
          <motion.div
            className="h-full rounded-full bg-interactive-primary"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-1 flex-col"
      >
        <div className="flex-1 overflow-y-auto px-16 pb-8 pt-20">
          {children}
        </div>

        <div className="border-t border-border-primary px-16 pb-8 pt-12">
          {onCta && (
            <StandardButton
              onClick={onCta}
              disabled={ctaDisabled}
              loading={ctaLoading}
            >
              {cta}
            </StandardButton>
          )}
          {secondaryCta && <div className="mt-8">{secondaryCta}</div>}
        </div>
      </motion.div>
    </main>
  );
}
