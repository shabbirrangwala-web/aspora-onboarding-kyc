"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCheck } from "lucide-react";
import { KYCShell } from "@/components/kyc/KYCShell";
import { useKYC } from "@/lib/kyc-store";
import { Input } from "@/components/ui/input";
import { StandardButton } from "@/components/ui/button";

const RELATIONSHIPS = [
  "Spouse / partner",
  "Parent",
  "Sibling",
  "Child",
  "Financial advisor",
  "Friend",
  "Other",
];

export default function KYCTrustedContact() {
  const router = useRouter();
  const { state, update } = useKYC();
  const existing = state.financial;

  const [firstName, setFirstName] = useState(existing?.trustedContactFirstName ?? "");
  const [lastName, setLastName] = useState(existing?.trustedContactLastName ?? "");
  const [email, setEmail] = useState(existing?.trustedContactEmail ?? "");
  const [phone, setPhone] = useState(existing?.trustedContactPhone ?? "");
  const [relationship, setRelationship] = useState("");

  function handleSkip() {
    router.push("/kyc/declarations");
  }

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
          equitiesExperience: "",
          optionsExperience: "",
        }),
        trustedContactFirstName: firstName,
        trustedContactLastName: lastName,
        trustedContactEmail: email,
        trustedContactPhone: phone,
      },
    });
    router.push("/kyc/declarations");
  }

  return (
    <KYCShell
      title="Trusted contact"
      step={11}
      totalSteps={15}
      cta="Continue"
      onCta={handleContinue}
      secondaryCta={
        <StandardButton hierarchy="tertiary" onClick={handleSkip}>
          Skip
        </StandardButton>
      }
    >
      {/* Header */}
      <div className="flex items-center gap-12">
        <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-12 bg-surface-secondary">
          <UserCheck className="h-20 w-20 text-on-surface-secondary" />
        </div>
        <div>
          <h2 className="type-headerSm text-on-surface-primary">Trusted contact</h2>
          <p className="text-[12px] text-on-surface-tertiary">Optional — you can skip this</p>
        </div>
      </div>

      <p className="mt-16 type-bodySm text-on-surface-secondary">
        FINRA recommends designating a trusted contact — someone we can reach out to if we notice unusual activity or are unable to contact you. They cannot access or transact on your account.
      </p>

      <div className="mt-24 flex flex-col gap-16">
        <div className="flex gap-12">
          <div className="flex-1">
            <Input
              label="First name"
              placeholder="Jane"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              optional
            />
          </div>
          <div className="flex-1">
            <Input
              label="Last name"
              placeholder="Smith"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              optional
            />
          </div>
        </div>

        <Input
          label="Email address"
          placeholder="jane@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          optional
        />

        <Input
          label="Phone number"
          placeholder="+44 7700 900000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          optional
        />

        {/* Relationship chips */}
        <div className="flex flex-col gap-8">
          <p className="text-[12px] font-semibold text-on-surface-secondary">
            Relationship <span className="font-normal text-on-surface-tertiary">(optional)</span>
          </p>
          <div className="flex flex-wrap gap-8">
            {RELATIONSHIPS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRelationship(relationship === r ? "" : r)}
                className={
                  relationship === r
                    ? "rounded-full border-[1.5px] border-on-surface-primary bg-on-surface-primary px-12 py-6 text-[12px] font-medium text-surface-primary"
                    : "rounded-full border-[1.5px] border-border-primary px-12 py-6 text-[12px] font-medium text-on-surface-secondary hover:bg-overlay-light-hover"
                }
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-20 rounded-12 bg-surface-secondary p-12">
        <p className="text-[12px] leading-[18px] text-on-surface-secondary">
          <span className="font-semibold text-on-surface-primary">Privacy:</span>{" "}
          Your trusted contact will only be reached in exceptional circumstances such as suspected financial exploitation or if your account shows signs of cognitive impairment. They will not receive account statements or be given trading access.
        </p>
      </div>
    </KYCShell>
  );
}
