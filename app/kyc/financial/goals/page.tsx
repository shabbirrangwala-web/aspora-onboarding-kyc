"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Info, X } from "lucide-react";
import { KYCShell } from "@/components/kyc/KYCShell";
import { useKYC } from "@/lib/kyc-store";
import { ListItem } from "@/components/ui/list-item";
import { cn } from "@/lib/utils";

const ANNUAL_INCOME = [
  { id: "0_24999", label: "Under $25,000" },
  { id: "25000_49999", label: "$25,000 – $49,999" },
  { id: "50000_99999", label: "$50,000 – $99,999" },
  { id: "100000_299999", label: "$100,000 – $299,999" },
  { id: "300000_plus", label: "$300,000 and above" },
];

// Updated to match Alpaca-specified ranges
const LIQUID_NET_WORTH = [
  { id: "0_19999",         label: "$0 – $19,999" },
  { id: "20000_49999",     label: "$20,000 – $49,999" },
  { id: "50000_99999",     label: "$50,000 – $99,999" },
  { id: "100000_499999",   label: "$100,000 – $499,999" },
  { id: "500000_999999",   label: "$500,000 – $999,999" },
  { id: "1000000_9999999", label: "$1,000,000 – $9,999,999" },
];

const TOTAL_NET_WORTH = [
  { id: "0_49999",          label: "Under $50,000" },
  { id: "50000_249999",     label: "$50,000 – $249,999" },
  { id: "250000_999999",    label: "$250,000 – $999,999" },
  { id: "1000000_4999999",  label: "$1,000,000 – $4,999,999" },
  { id: "5000000_plus",     label: "$5,000,000 and above" },
];

const INVESTMENT_OBJECTIVES = [
  { id: "preservation", label: "Capital preservation", description: "Protect principal above all else" },
  { id: "income",       label: "Income",               description: "Regular returns from dividends or interest" },
  { id: "growth",       label: "Growth",               description: "Long-term appreciation with moderate risk" },
  { id: "speculation",  label: "Speculation",          description: "High-risk bets for potentially higher returns" },
];

const RISK_TOLERANCES = [
  { id: "conservative", label: "Conservative", description: "Minimal losses; prefer stable, predictable returns" },
  { id: "moderate",     label: "Moderate",     description: "Accept occasional dips for better long-term growth" },
  { id: "aggressive",   label: "Aggressive",   description: "Comfortable with significant volatility for maximum upside" },
];

const LIQUIDITY_NEEDS = [
  { id: "does_not_apply",    label: "Not important",       description: "I won't need this money for 5+ years" },
  { id: "somewhat_important", label: "Somewhat important", description: "I may need some within 2–5 years" },
  { id: "very_important",    label: "Very important",      description: "I may need access within 2 years" },
];

// Tooltip definitions
const INFO_LIQUID = `Investable / liquid assets is your net worth minus assets that cannot be converted quickly and easily into cash, such as real estate, business equity, personal property and automobiles, expected inheritances, assets earmarked for other purposes, and investments or accounts subject to substantial penalties if sold or withdrawn.`;

const INFO_INCOME = `Annual household income includes income from all sources such as employment, alimony, social security, investment income, and other income sources before tax.`;

function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="ml-6 flex h-16 w-16 items-center justify-center rounded-full text-on-surface-tertiary hover:text-on-surface-secondary"
        aria-label="More information"
      >
        <Info className="h-14 w-14" />
      </button>
      {open && (
        <div className="absolute left-0 top-24 z-10 w-[280px] rounded-12 border-[1.5px] border-border-primary bg-surface-primary p-12 shadow-lg">
          <div className="flex items-start justify-between gap-8">
            <p className="text-[12px] leading-[18px] text-on-surface-secondary">{text}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="shrink-0 text-on-surface-tertiary hover:text-on-surface-primary"
            >
              <X className="h-14 w-14" />
            </button>
          </div>
        </div>
      )}
    </span>
  );
}

function RadioGroup({
  label,
  hint,
  info,
  options,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  info?: string;
  options: { id: string; label: string; description?: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="flex items-center text-[13px] font-semibold text-on-surface-primary">
          {label}
          {info && <InfoTooltip text={info} />}
        </p>
        {hint && <p className="mt-4 text-[12px] text-on-surface-tertiary">{hint}</p>}
      </div>
      <div className="overflow-hidden rounded-12 border-[1.5px] border-border-primary">
        {options.map((opt, i) => (
          <ListItem
            key={opt.id}
            type="radio"
            title={opt.label}
            description={opt.description}
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

export default function KYCFinancialGoals() {
  const router = useRouter();
  const { state, update } = useKYC();
  const existing = state.financial;

  const [annualIncome, setAnnualIncome]             = useState(existing?.annualIncome ?? "");
  // Pre-select "$50,000 – $99,999" as default liquid net worth range
  const [liquidNetWorth, setLiquidNetWorth]         = useState(existing?.liquidNetWorth ?? "50000_99999");
  const [totalNetWorth, setTotalNetWorth]           = useState(existing?.totalNetWorth ?? "");
  const [investmentObjective, setInvestmentObjective] = useState(existing?.investmentObjective ?? "");
  const [riskTolerance, setRiskTolerance]           = useState(existing?.riskTolerance ?? "");
  const [liquidityNeeds, setLiquidityNeeds]         = useState(existing?.liquidityNeeds ?? "");

  const canContinue = !!annualIncome && !!liquidNetWorth && !!totalNetWorth && !!investmentObjective && !!riskTolerance && !!liquidityNeeds;

  function handleContinue() {
    update({
      financial: {
        ...(existing ?? {
          employmentStatus: "",
          employerName: "",
          employerAddress: "",
          occupation: "",
          fundingSource: "",
          equitiesExperience: "",
          optionsExperience: "",
          trustedContactFirstName: "",
          trustedContactLastName: "",
          trustedContactEmail: "",
          trustedContactPhone: "",
        }),
        annualIncome,
        liquidNetWorth,
        totalNetWorth,
        investmentObjective,
        riskTolerance,
        liquidityNeeds,
      },
    });
    router.push("/kyc/financial/experience");
  }

  return (
    <KYCShell
      title="Financial profile"
      step={9}
      totalSteps={15}
      ctaDisabled={!canContinue}
      onCta={handleContinue}
    >
      <h2 className="type-headerSm text-on-surface-primary">Wealth &amp; investment goals</h2>
      <p className="mt-8 type-bodySm text-on-surface-secondary">
        Helps us understand your financial position and what you want to achieve.
      </p>

      <div className="mt-24 flex flex-col gap-24">
        <RadioGroup
          label="Annual household income"
          hint="Total income from all sources before tax"
          info={INFO_INCOME}
          options={ANNUAL_INCOME}
          value={annualIncome}
          onChange={setAnnualIncome}
        />

        <RadioGroup
          label="Investable / liquid assets"
          hint="Your net worth excluding illiquid assets"
          info={INFO_LIQUID}
          options={LIQUID_NET_WORTH}
          value={liquidNetWorth}
          onChange={setLiquidNetWorth}
        />

        <RadioGroup
          label="Total net worth"
          hint="All assets minus all liabilities, including real estate and retirement accounts"
          options={TOTAL_NET_WORTH}
          value={totalNetWorth}
          onChange={setTotalNetWorth}
        />

        <RadioGroup
          label="Investment objective"
          hint="What are you primarily trying to achieve?"
          options={INVESTMENT_OBJECTIVES}
          value={investmentObjective}
          onChange={setInvestmentObjective}
        />

        <RadioGroup
          label="Risk tolerance"
          hint="How would you react to a sudden 20% drop in your portfolio?"
          options={RISK_TOLERANCES}
          value={riskTolerance}
          onChange={setRiskTolerance}
        />

        <RadioGroup
          label="Liquidity needs"
          hint="How soon might you need access to the funds you invest?"
          options={LIQUIDITY_NEEDS}
          value={liquidityNeeds}
          onChange={setLiquidityNeeds}
        />
      </div>
    </KYCShell>
  );
}
