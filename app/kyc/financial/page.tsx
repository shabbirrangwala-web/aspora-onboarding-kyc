"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KYCShell } from "@/components/kyc/KYCShell";
import { useKYC } from "@/lib/kyc-store";
import { ListItem } from "@/components/ui/list-item";
import { Input } from "@/components/ui/input";
import { StandardButton } from "@/components/ui/button";

const EMPLOYMENT_STATUSES = [
  { id: "employed", label: "Employed" },
  { id: "self_employed", label: "Self-employed" },
  { id: "unemployed", label: "Unemployed" },
  { id: "student", label: "Student" },
  { id: "retired", label: "Retired" },
];

const FUNDING_SOURCES = [
  { id: "employment_income", label: "Employment income" },
  { id: "investments", label: "Investments" },
  { id: "inheritance", label: "Inheritance" },
  { id: "business_income", label: "Business income" },
  { id: "savings", label: "Savings" },
  { id: "family", label: "Family" },
];

function RadioGroup({
  label,
  hint,
  options,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  options: { id: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-[13px] font-semibold text-on-surface-primary">{label}</p>
        {hint && <p className="mt-4 text-[12px] text-on-surface-tertiary">{hint}</p>}
      </div>
      <div className="overflow-hidden rounded-12 border-[1.5px] border-border-primary">
        {options.map((opt, i) => (
          <ListItem
            key={opt.id}
            type="radio"
            title={opt.label}
            showLeading={false}
            showDivider={i < options.length - 1}
            checked={value === opt.id}
            onCheckedChange={() => onChange(opt.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default function KYCFinancialEmployment() {
  const router = useRouter();
  const { state, update } = useKYC();
  const existing = state.financial;

  const [employmentStatus, setEmploymentStatus] = useState(existing?.employmentStatus ?? "");
  const [employerName, setEmployerName] = useState(existing?.employerName ?? "");
  const [employerAddress, setEmployerAddress] = useState(existing?.employerAddress ?? "");
  const [occupation, setOccupation] = useState(existing?.occupation ?? "");
  const [fundingSource, setFundingSource] = useState(existing?.fundingSource ?? "");
  const [skipped, setSkipped] = useState(false);

  const isEmployed = ["employed", "self_employed"].includes(employmentStatus);
  const employerFilled = !isEmployed || skipped || !!employerName;
  const canContinue = !!employmentStatus && !!fundingSource && employerFilled;

  function handleContinue() {
    update({
      financial: {
        ...(existing ?? {
          annualIncome: "",
          liquidNetWorth: "",
          totalNetWorth: "",
          investmentObjective: "",
          riskTolerance: "",
          liquidityNeeds: "",
          equitiesExperience: "",
          optionsExperience: "",
          trustedContactFirstName: "",
          trustedContactLastName: "",
          trustedContactEmail: "",
          trustedContactPhone: "",
        }),
        employmentStatus,
        employerName: skipped ? "" : employerName,
        employerAddress: skipped ? "" : employerAddress,
        occupation,
        fundingSource,
      },
    });
    router.push("/kyc/financial/goals");
  }

  return (
    <KYCShell
      title="Financial profile"
      step={8}
      totalSteps={15}
      ctaDisabled={!canContinue}
      onCta={handleContinue}
    >
      <h2 className="type-headerSm text-on-surface-primary">Employment &amp; income</h2>
      <p className="mt-8 type-bodySm text-on-surface-secondary">
        Required by Alpaca Securities to assess suitability under FINRA regulations.
      </p>

      <div className="mt-24 flex flex-col gap-24">
        <RadioGroup
          label="Employment status"
          options={EMPLOYMENT_STATUSES}
          value={employmentStatus}
          onChange={(v) => {
            setEmploymentStatus(v);
            if (!["employed", "self_employed"].includes(v)) setSkipped(false);
          }}
        />

        {isEmployed && !skipped && (
          <div className="flex flex-col gap-12">
            <p className="text-[13px] font-semibold text-on-surface-primary">Employer details</p>
            <Input
              label="Employer name"
              placeholder="Acme Corporation"
              value={employerName}
              onChange={(e) => setEmployerName(e.target.value)}
            />
            <Input
              label="Employer address"
              placeholder="200 West Street, New York, NY 10282"
              value={employerAddress}
              onChange={(e) => setEmployerAddress(e.target.value)}
              optional
            />
            <StandardButton hierarchy="tertiary" onClick={() => setSkipped(true)}>
              Skip for now
            </StandardButton>
          </div>
        )}

        {isEmployed && skipped && (
          <div className="rounded-12 bg-warning-light p-12">
            <p className="text-[12px] text-warning-on-light">
              Employer details skipped. We&apos;ll ask again in 30 days — required by our broker.
            </p>
          </div>
        )}

        {isEmployed && (
          <div className="flex flex-col gap-8">
            <Input
              label="Occupation / job title"
              placeholder="e.g. Software Engineer"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              optional
            />
          </div>
        )}

        <RadioGroup
          label="Primary source of funds"
          hint="Where does the money you plan to invest come from?"
          options={FUNDING_SOURCES}
          value={fundingSource}
          onChange={setFundingSource}
        />
      </div>
    </KYCShell>
  );
}
