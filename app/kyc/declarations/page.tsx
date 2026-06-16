"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KYCShell } from "@/components/kyc/KYCShell";
import { useKYC } from "@/lib/kyc-store";
import { Checkbox } from "@/components/ui/checkbox";

const AFFILIATIONS = [
  {
    id: "broker_dealer",
    text: "Affiliated with or work for a US registered broker-dealer or FINRA",
  },
  {
    id: "public_company",
    text: "Senior executive at, or 10% or greater shareholder of, a publicly traded company",
  },
  {
    id: "political_figure",
    text: "A senior political figure (government official, politician, or senior executive of a state-owned enterprise)",
  },
  {
    id: "political_family",
    text: "An immediate family member or close associate of a senior political figure",
  },
];

export default function KYCDeclarations() {
  const router = useRouter();
  const { update } = useKYC();

  const [checked, setChecked] = useState<Record<string, boolean>>({
    broker_dealer: false,
    public_company: false,
    political_figure: false,
    political_family: false,
    none: false,
  });

  function toggle(id: string) {
    if (id === "none") {
      const noneNext = !checked.none;
      setChecked({
        broker_dealer: false,
        public_company: false,
        political_figure: false,
        political_family: false,
        none: noneNext,
      });
    } else {
      setChecked((prev) => ({ ...prev, [id]: !prev[id], none: false }));
    }
  }

  const anyAffiliation = AFFILIATIONS.some((a) => checked[a.id]);
  const canContinue = checked.none || anyAffiliation;
  const requiresAffiliationDisclosure = checked.broker_dealer || checked.public_company;

  function handleContinue() {
    update({
      declarations: {
        finraAffiliated: checked.broker_dealer,
        controlPerson: checked.public_company,
        pepSelf: checked.political_figure,
        pepFamily: checked.political_family,
        noneApply: checked.none,
      },
    });
    if (requiresAffiliationDisclosure) {
      router.push("/kyc/declarations/affiliation");
    } else {
      router.push("/kyc/screening");
    }
  }

  return (
    <KYCShell
      title="Declarations"
      step={12}
      totalSteps={15}
      ctaDisabled={!canContinue}
      onCta={handleContinue}
    >
      <h2 className="type-headerSm text-on-surface-primary">Affiliations & disclosures</h2>
      <p className="mt-8 type-bodySm text-on-surface-secondary">
        Required by FINRA. Select all that apply to you or an immediate family member.
      </p>

      {/* Affiliation items — outer div handles click; Checkbox is display-only to avoid button-in-button */}
      <div className="mt-24 overflow-hidden rounded-12 border-[1.5px] border-border-primary">
        {AFFILIATIONS.map((item, i) => (
          <div
            key={item.id}
            role="presentation"
            onClick={() => toggle(item.id)}
            className="flex cursor-pointer items-start gap-12 px-16 py-14 transition-colors hover:bg-overlay-light-hover active:bg-overlay-light-pressed"
            style={{ borderBottom: i < AFFILIATIONS.length - 1 ? "1px solid var(--color-border-primary)" : undefined }}
          >
            <Checkbox checked={checked[item.id]} />
            <span className="text-[14px] leading-[20px] text-on-surface-primary">{item.text}</span>
          </div>
        ))}
      </div>

      <div className="mt-12 overflow-hidden rounded-12 border-[1.5px] border-border-primary">
        <div
          role="presentation"
          onClick={() => toggle("none")}
          className="flex w-full cursor-pointer items-start gap-12 px-16 py-14 transition-colors hover:bg-overlay-light-hover active:bg-overlay-light-pressed"
        >
          <Checkbox checked={checked.none} />
          <span className="text-[14px] font-medium leading-[20px] text-on-surface-primary">
            None of the above apply to me or my immediate family
          </span>
        </div>
      </div>

      {requiresAffiliationDisclosure && (
        <div className="mt-16 rounded-12 border-[1.5px] border-warning-border bg-warning-light p-12">
          <p className="text-[12px] leading-[18px] text-warning-on-light">
            <span className="font-semibold">Additional step required.</span> As an affiliated person, you must upload a compliance letter from your firm on the next screen before your application can proceed.
          </p>
        </div>
      )}

      {anyAffiliation && !requiresAffiliationDisclosure && (
        <div className="mt-16 rounded-12 bg-surface-secondary p-12">
          <p className="text-[12px] leading-[18px] text-on-surface-secondary">
            <span className="font-semibold text-on-surface-primary">Note:</span> Your account may require additional review based on your selections. Our compliance team will follow up if needed.
          </p>
        </div>
      )}

      <div className="mt-16 rounded-12 bg-surface-secondary p-12">
        <p className="text-[11px] leading-[16px] text-on-surface-tertiary">
          These disclosures are required under FINRA Rule 4311 and SEC regulations. Providing false information may result in account suspension.
        </p>
      </div>
    </KYCShell>
  );
}
