"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KYCShell } from "@/components/kyc/KYCShell";
import { useKYC } from "@/lib/kyc-store";
import { cn } from "@/lib/utils";

const EXPERIENCE_LEVELS = [
  { id: "none", label: "None" },
  { id: "under_2yr", label: "< 2 yrs" },
  { id: "2_5yr", label: "2–5 yrs" },
  { id: "over_5yr", label: "5+ yrs" },
];

function ExperiencePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      <p className="text-[12px] font-semibold text-on-surface-secondary">{label}</p>
      <div className="flex gap-8">
        {EXPERIENCE_LEVELS.map((lvl) => (
          <button
            key={lvl.id}
            type="button"
            onClick={() => onChange(lvl.id)}
            className={cn(
              "flex flex-1 items-center justify-center rounded-8 border-[1.5px] py-10 text-[12px] font-medium transition-all",
              value === lvl.id
                ? "border-on-surface-primary bg-on-surface-primary text-surface-primary"
                : "border-border-primary text-on-surface-secondary hover:bg-overlay-light-hover active:bg-overlay-light-pressed"
            )}
          >
            {lvl.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function KYCFinancialExperience() {
  const router = useRouter();
  const { state, update } = useKYC();
  const existing = state.financial;

  const [equitiesExperience, setEquitiesExperience] = useState(existing?.equitiesExperience ?? "");
  const [optionsExperience, setOptionsExperience] = useState(existing?.optionsExperience ?? "");

  const canContinue = !!equitiesExperience && !!optionsExperience;

  function handleContinue() {
    update({
      financial: {
        ...(existing ?? {
          employmentStatus: "",
          employerName: "",
          employerAddress: "",
          occupation: "",
          fundingSource: "",
          annualIncome: "",
          liquidNetWorth: "",
          totalNetWorth: "",
          investmentObjective: "",
          riskTolerance: "",
          liquidityNeeds: "",
          trustedContactFirstName: "",
          trustedContactLastName: "",
          trustedContactEmail: "",
          trustedContactPhone: "",
        }),
        equitiesExperience,
        optionsExperience,
      },
    });
    router.push("/kyc/financial/trusted-contact");
  }

  return (
    <KYCShell
      title="Financial profile"
      step={10}
      totalSteps={15}
      ctaDisabled={!canContinue}
      onCta={handleContinue}
    >
      <h2 className="type-headerSm text-on-surface-primary">Trading experience</h2>
      <p className="mt-8 type-bodySm text-on-surface-secondary">
        Helps determine which products you can access. Your answers affect options trading eligibility.
      </p>

      <div className="mt-24 flex flex-col gap-16">
        <ExperiencePicker
          label="Stocks & ETFs"
          value={equitiesExperience}
          onChange={setEquitiesExperience}
        />
        <ExperiencePicker
          label="Options"
          value={optionsExperience}
          onChange={setOptionsExperience}
        />
      </div>

      {optionsExperience === "none" && (
        <div className="mt-20 rounded-12 bg-surface-secondary p-12">
          <p className="text-[12px] leading-[17px] text-on-surface-secondary">
            <span className="font-semibold text-on-surface-primary">No options experience?</span>{" "}
            You can still trade stocks &amp; ETFs. Options access can be applied for later once you&apos;ve built your trading history.
          </p>
        </div>
      )}
    </KYCShell>
  );
}
