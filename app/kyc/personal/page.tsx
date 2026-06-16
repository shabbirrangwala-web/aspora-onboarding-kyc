"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KYCShell } from "@/components/kyc/KYCShell";
import { useKYC } from "@/lib/kyc-store";
import { ListItem } from "@/components/ui/list-item";
import { cn } from "@/lib/utils";

const MARITAL_STATUSES = [
  { id: "single", label: "Single" },
  { id: "married", label: "Married" },
  { id: "domestic_partnership", label: "Domestic partnership" },
  { id: "divorced", label: "Divorced" },
  { id: "widowed", label: "Widowed" },
];

const DEPENDENTS = ["0", "1", "2", "3", "4+"];

export default function KYCPersonal() {
  const router = useRouter();
  const { state, update } = useKYC();

  const [maritalStatus, setMaritalStatus] = useState(state.maritalStatus ?? "");
  const [dependents, setDependents] = useState(state.dependents ?? "");

  const canContinue = !!maritalStatus && !!dependents;

  function handleContinue() {
    update({ maritalStatus, dependents });
    router.push("/kyc/financial");
  }

  return (
    <KYCShell
      title="Personal profile"
      step={7}
      totalSteps={15}
      ctaDisabled={!canContinue}
      onCta={handleContinue}
    >
      <h2 className="type-headerSm text-on-surface-primary">Personal details</h2>
      <p className="mt-8 type-bodySm text-on-surface-secondary">
        Required by Alpaca Securities for suitability assessment under FINRA regulations.
      </p>

      <div className="mt-24 flex flex-col gap-24">
        {/* Marital status */}
        <div className="flex flex-col gap-8">
          <p className="text-[13px] font-semibold text-on-surface-primary">Marital status</p>
          <div className="overflow-hidden rounded-12 border-[1.5px] border-border-primary">
            {MARITAL_STATUSES.map((opt, i) => (
              <ListItem
                key={opt.id}
                type="radio"
                title={opt.label}
                showLeading={false}
                showDivider={i < MARITAL_STATUSES.length - 1}
                checked={maritalStatus === opt.id}
                onCheckedChange={() => setMaritalStatus(opt.id)}
              />
            ))}
          </div>
        </div>

        {/* Number of dependents */}
        <div className="flex flex-col gap-8">
          <div>
            <p className="text-[13px] font-semibold text-on-surface-primary">Number of dependents</p>
            <p className="mt-4 text-[12px] text-on-surface-tertiary">
              Children, elderly parents, or others financially dependent on you
            </p>
          </div>
          <div className="flex gap-8">
            {DEPENDENTS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setDependents(val)}
                className={cn(
                  "flex flex-1 items-center justify-center rounded-8 border-[1.5px] py-10 text-[13px] font-medium transition-all",
                  dependents === val
                    ? "border-on-surface-primary bg-on-surface-primary text-surface-primary"
                    : "border-border-primary text-on-surface-secondary hover:bg-overlay-light-hover active:bg-overlay-light-pressed"
                )}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      </div>
    </KYCShell>
  );
}
