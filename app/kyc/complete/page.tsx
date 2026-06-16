"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useKYC } from "@/lib/kyc-store";
import { StandardButton } from "@/components/ui/button";

const STAGES = [
  { id: "identity", label: "Identity verified" },
  { id: "tax", label: "Tax documents signed" },
  { id: "financial", label: "Financial profile complete" },
  { id: "screening", label: "Background checks passed" },
  { id: "agreements", label: "Agreements signed" },
];

export default function KYCComplete() {
  const router = useRouter();
  const { state } = useKYC();
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setVisibleCount(i);
      if (i >= STAGES.length) clearInterval(id);
    }, 300);
    return () => clearInterval(id);
  }, []);

  const firstName = state.identityData?.firstName ?? "there";

  return (
    <div className="flex min-h-dvh flex-col bg-surface-primary">
      <div className="flex flex-1 flex-col items-center justify-center px-24 py-48">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
          className="flex h-64 w-64 items-center justify-center rounded-full bg-success-light"
        >
          <CheckCircle2 className="h-32 w-32 text-success-on-light" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-24 text-center"
        >
          <h1 className="type-headerLg text-on-surface-primary">You&apos;re all set, {firstName}!</h1>
          <p className="mt-8 type-bodySm text-on-surface-secondary max-w-[300px]">
            Your application has been submitted to Alpaca Securities for review. This typically takes 1–2 business days.
          </p>
        </motion.div>

        <div className="mt-32 w-full max-w-[360px] flex flex-col gap-0 overflow-hidden rounded-12 border-[1.5px] border-border-primary">
          {STAGES.map((stage, i) => (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -8 }}
              animate={visibleCount > i ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-12 px-16 py-12"
              style={{ borderBottom: i < STAGES.length - 1 ? "1px solid var(--color-border-primary)" : undefined }}
            >
              <CheckCircle2 className="h-16 w-16 shrink-0 text-success-on-light" />
              <span className="text-[14px] text-on-surface-primary">{stage.label}</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 w-full max-w-[360px] rounded-12 bg-surface-secondary p-16">
          <p className="text-[12px] font-semibold text-on-surface-primary mb-4">What happens next?</p>
          <div className="flex flex-col gap-8 mt-8">
            {[
              "Aspora reviews your documents (1–2 business days)",
              "You'll receive an email once your account is approved",
              "Fund your account and start investing in US equities",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-8">
                <span className="mt-0.5 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-on-surface-primary text-[10px] font-semibold text-surface-primary">
                  {i + 1}
                </span>
                <p className="text-[12px] leading-[18px] text-on-surface-secondary">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-border-primary bg-surface-primary px-24 py-16 flex flex-col gap-8">
        {state.scenario && (
          <StandardButton
            hierarchy="primary"
            onClick={() => router.push(`/cip/flow/${state.scenario}`)}
          >
            View CIP journey →
          </StandardButton>
        )}
        <StandardButton hierarchy="secondary" onClick={() => router.push("/")}>
          Back to scenarios
        </StandardButton>
      </div>
    </div>
  );
}
