"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { KYCShell } from "@/components/kyc/KYCShell";
import { useKYC } from "@/lib/kyc-store";
import { cn } from "@/lib/utils";

const CHECKS = [
  { id: "ofac", label: "OFAC sanctions list", description: "US Treasury Office of Foreign Assets Control" },
  { id: "pep", label: "Politically exposed persons", description: "PEP screening across global databases" },
  { id: "aml", label: "AML watchlists", description: "Anti-money laundering global watchlists" },
  { id: "adverse", label: "Adverse media", description: "Financial crime & regulatory news screening" },
];

type CheckStatus = "pending" | "running" | "pass" | "fail";

export default function KYCScreening() {
  const router = useRouter();
  const { update } = useKYC();

  const [statuses, setStatuses] = useState<Record<string, CheckStatus>>(
    Object.fromEntries(CHECKS.map((c) => [c.id, "pending"]))
  );
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      for (const check of CHECKS) {
        if (cancelled) return;
        setStatuses((prev) => ({ ...prev, [check.id]: "running" }));
        await new Promise((r) => setTimeout(r, 900 + Math.random() * 400));
        if (cancelled) return;
        setStatuses((prev) => ({ ...prev, [check.id]: "pass" }));
      }
      if (!cancelled) {
        update({ screeningStatus: "pass" });
        setDone(true);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [update]);

  function handleContinue() {
    router.push("/kyc/disclosures");
  }

  const allPass = CHECKS.every((c) => statuses[c.id] === "pass");

  return (
    <KYCShell
      title="Background check"
      step={13}
      totalSteps={15}
      ctaDisabled={!done}
      ctaLoading={!done}
      cta={done ? "Continue" : "Checking…"}
      onCta={handleContinue}
    >
      <h2 className="type-headerSm text-on-surface-primary">Running background checks</h2>
      <p className="mt-8 type-bodySm text-on-surface-secondary">
        Required by Alpaca Securities as part of AML compliance. This takes just a moment.
      </p>

      <div className="mt-24 flex flex-col gap-0 overflow-hidden rounded-12 border-[1.5px] border-border-primary">
        {CHECKS.map((check, i) => {
          const status = statuses[check.id];
          return (
            <div
              key={check.id}
              className="flex items-center gap-12 px-16 py-14"
              style={{ borderBottom: i < CHECKS.length - 1 ? "1px solid var(--color-border-primary)" : undefined }}
            >
              <div className="w-20 shrink-0 flex items-center justify-center">
                {status === "pending" && (
                  <div className="h-16 w-16 rounded-full border-[1.5px] border-border-primary" />
                )}
                {status === "running" && (
                  <div className="h-16 w-16 animate-spin rounded-full border-[2px] border-border-primary border-t-on-surface-primary" />
                )}
                {status === "pass" && (
                  <CheckCircle2 className="h-16 w-16 text-success-on-light" />
                )}
                {status === "fail" && (
                  <AlertCircle className="h-16 w-16 text-danger-on-light" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-[14px] font-medium",
                  status === "pending" ? "text-on-surface-tertiary" : "text-on-surface-primary"
                )}>
                  {check.label}
                </p>
                <p className="text-[12px] text-on-surface-tertiary">{check.description}</p>
              </div>
              {status === "pass" && (
                <span className="text-[11px] font-medium text-success-on-light shrink-0">Clear</span>
              )}
            </div>
          );
        })}
      </div>

      {allPass && done && (
        <div className="mt-16 flex items-center gap-10 rounded-12 bg-success-light p-12">
          <CheckCircle2 className="h-16 w-16 shrink-0 text-success-on-light" />
          <p className="text-[13px] font-medium text-success-on-light">
            All checks passed — no issues found
          </p>
        </div>
      )}

      {!done && (
        <div className="mt-16 flex items-center gap-10 rounded-12 bg-surface-secondary p-12">
          <Clock className="h-16 w-16 shrink-0 text-on-surface-tertiary" />
          <p className="text-[12px] text-on-surface-secondary">
            Checks are automated. Results are provided by Alpaca&apos;s compliance infrastructure.
          </p>
        </div>
      )}
    </KYCShell>
  );
}
