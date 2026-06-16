"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KYCShell } from "@/components/kyc/KYCShell";
import { useKYC } from "@/lib/kyc-store";
import { Input } from "@/components/ui/input";

const TAX_CONFIG = {
  uae: {
    label: "Tax identifier",
    placeholder: "784-1992-XXXXXXX-X",
    helper:
      "UAE does not issue personal tax IDs. We use your Emirates ID number (preferred) or passport number as the identifier.",
    type: "national_id",
  },
  uk: {
    label: "National Insurance Number (NIN)",
    placeholder: "AB 12 34 56 C",
    helper:
      "Find your NIN on your NIN card, a payslip, or any letter from HMRC.",
    type: "nin",
  },
};

export default function KYCTax() {
  const router = useRouter();
  const { state, update } = useKYC();
  const config = TAX_CONFIG[state.country ?? "uae"];
  const [taxId, setTaxId] = useState(
    state.taxId || state.identityData?.idNumber || ""
  );

  return (
    <KYCShell
      title="Tax identifier"
      step={5}
      totalSteps={15}
      ctaDisabled={!taxId.trim()}
      onCta={() => {
        update({ taxId: taxId.trim(), taxIdType: config.type });
        router.push("/kyc/contact");
      }}
    >
      <h2 className="type-headerSm text-on-surface-primary">Tax identification</h2>
      <p className="mt-8 type-bodySm text-on-surface-secondary">
        Required for US securities reporting under FATCA. This is passed to Alpaca as part of your account opening.
      </p>

      <div className="mt-24">
        <Input
          label={config.label}
          placeholder={config.placeholder}
          value={taxId}
          onChange={(e) => setTaxId(e.target.value)}
          helper={config.helper}
        />
      </div>

      <div className="mt-16 rounded-12 bg-surface-secondary p-16">
        <p className="text-[12px] font-semibold text-on-surface-secondary mb-8">Why is this required?</p>
        <p className="text-[12px] leading-[18px] text-on-surface-secondary">
          As a non-US investor, the IRS requires your tax identifier to report dividend income and capital gains on US securities. This is a legal requirement under FATCA (Foreign Account Tax Compliance Act).
        </p>
      </div>
    </KYCShell>
  );
}
