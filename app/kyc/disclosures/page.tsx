"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { KYCShell } from "@/components/kyc/KYCShell";
import { useKYC } from "@/lib/kyc-store";
import { Checkbox } from "@/components/ui/checkbox";

const DISCLOSURES = [
  {
    title: "Use and Risk Disclosure",
    url: "https://files.alpaca.markets/disclosures/library/UseAndRisk.pdf",
  },
  {
    title: "Terms and Conditions",
    url: null,
  },
  {
    title: "Privacy Notice",
    url: "https://files.alpaca.markets/disclosures/library/AlpacaSecuritiesPrivacyNotice.pdf",
  },
  {
    title: "Payment for Order Flow (PFOF)",
    url: "https://files.alpaca.markets/disclosures/library/PFOF.pdf",
  },
  {
    title: "Margin Disclosure Statement",
    url: "https://files.alpaca.markets/disclosures/library/MarginDiscStmt.pdf",
  },
  {
    title: "Extended Hours & Overnight Trading Risk",
    url: "https://files.alpaca.markets/disclosures/library/ExtHrsOvernightRisk.pdf",
  },
  {
    title: "Business Continuity Plan Summary",
    url: "https://files.alpaca.markets/disclosures/library/SecuritiesBCPSummary.pdf",
  },
  {
    title: "Form CRS — Customer Relationship Summary",
    url: "https://files.alpaca.markets/disclosures/library/FormCRS.pdf",
  },
];

export default function KYCDisclosures() {
  const router = useRouter();
  const { update } = useKYC();
  const [confirmed, setConfirmed] = useState(false);

  function handleContinue() {
    update({ disclosuresAcknowledged: true });
    router.push("/kyc/agreements");
  }

  return (
    <KYCShell
      title="Disclosures"
      step={14}
      totalSteps={15}
      cta="Continue"
      ctaDisabled={!confirmed}
      onCta={handleContinue}
    >
      <h2 className="type-headerSm text-on-surface-primary">Required disclosures</h2>
      <p className="mt-8 type-bodySm text-on-surface-secondary">
        Please review each disclosure below before proceeding. These are required by Alpaca Securities and applicable regulations.
      </p>

      <div className="mt-20 overflow-hidden rounded-12 border-[1.5px] border-border-primary">
        {DISCLOSURES.map((d, i) => (
          <div
            key={d.title}
            className={`flex items-center justify-between gap-12 px-14 py-12${i < DISCLOSURES.length - 1 ? " border-b border-border-primary" : ""}`}
          >
            <span className="text-[13px] font-medium text-on-surface-primary">{d.title}</span>
            {d.url ? (
              <a
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex shrink-0 items-center gap-4 text-[12px] font-medium text-on-surface-secondary hover:text-on-surface-primary"
              >
                View
                <ExternalLink className="h-12 w-12" />
              </a>
            ) : (
              <span className="text-[12px] text-on-surface-tertiary">Aspora T&amp;C</span>
            )}
          </div>
        ))}
      </div>

      {/* Confirmation checkbox */}
      <div className="mt-16 flex w-full items-start gap-12 rounded-12 border-[1.5px] border-border-primary p-14">
        <Checkbox
          checked={confirmed}
          onChange={setConfirmed}
          label="I confirm I have read and understood all of the above disclosures"
        />
      </div>
    </KYCShell>
  );
}
