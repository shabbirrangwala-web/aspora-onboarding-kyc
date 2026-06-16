"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ExternalLink, CheckCircle2, FileText } from "lucide-react";
import { KYCShell } from "@/components/kyc/KYCShell";
import { useKYC } from "@/lib/kyc-store";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface InlineLink {
  text: string;
  href: string;
}

interface Agreement {
  id: string;
  tag?: string;
  title: string;
  subtitle: string;
  pdfUrl?: string;
  pdfLabel?: string;
  body: string;
  inlineLinks?: InlineLink[];
  checkLabel: string;
}

const AGREEMENTS: Agreement[] = [
  {
    id: "w8ben",
    tag: "IRS Form",
    title: "W-8BEN",
    subtitle: "Certificate of Foreign Status of Beneficial Owner",
    body:
      "I certify that I am not a US citizen, US resident alien or other US person for US tax purposes, and I am submitting the applicable Form W-8BEN with this form to certify my foreign status and, if applicable, claim tax treaty benefits.\n\n" +
      "I declare that I have examined the information on this form and to the best of my knowledge and belief it is true, correct, and complete. I further certify under penalties of perjury that:\n\n" +
      "(1) I am the individual that is the beneficial owner of all the income to which this form relates;\n" +
      "(2) The person named on line 1 of this form is not a U.S. person;\n" +
      "(3) This form relates to income not effectively connected with the conduct of a trade or business in the United States;\n" +
      "(4) The income to which this form relates is not subject to backup withholding;\n" +
      "(5) I consent to electronic delivery of this form and acknowledge that my electronic signature has the same legal effect as a handwritten signature.\n\n" +
      "This form must be renewed every 3 years per IRS requirements. Your IP address and timestamp will be recorded at the point of signing.",
    checkLabel: "I certify my foreign status under penalty of perjury",
  },
  {
    id: "customer_agreement",
    title: "Customer Account Agreement",
    subtitle: "Alpaca Securities LLC — Account Application, Margin & Customer Agreement",
    pdfUrl: "https://files.alpaca.markets/disclosures/library/AcctAppMarginAndCustAgmt.pdf",
    pdfLabel: "View Customer Account Agreement PDF",
    body:
      "This Agreement is entered into between you (the \"Customer\") and Alpaca Securities LLC (\"Alpaca\"), a registered broker-dealer and member of FINRA and SIPC.\n\n" +
      "By opening an account, you agree to be bound by this Agreement, the Alpaca Terms of Service, and all applicable rules and regulations of the SEC, FINRA, and any applicable self-regulatory organisations.\n\n" +
      "You authorise Alpaca to:\n" +
      "(1) Open and maintain a brokerage account in your name;\n" +
      "(2) Execute orders for the purchase and sale of securities on your behalf;\n" +
      "(3) Hold in custody any cash, securities, or other assets in your account;\n" +
      "(4) Share required information with clearing brokers, regulatory bodies, and tax authorities as required by applicable law;\n" +
      "(5) Act as your broker in connection with transactions in securities markets.\n\n" +
      "You acknowledge that investment in securities involves risk of loss and that past performance is not indicative of future results. You represent that you are of legal age in your jurisdiction and have the legal authority to enter into this Agreement.\n\n" +
      "This Agreement shall be governed by the laws of the State of New York. Any dispute arising hereunder shall be resolved by binding arbitration in accordance with FINRA rules.",
    checkLabel: "I have read, understood, and agree to be bound by Alpaca Securities LLC and Vance Inc account terms, and all other terms, disclosures and disclaimers applicable to me, as referenced in the Alpaca Customer Agreement. I also acknowledge that the Alpaca Customer Agreement contains a pre-dispute arbitration clause in Section 44.",
  },
  {
    id: "options_agreement",
    title: "Options Agreement & OCC Risk Disclosure",
    subtitle: "Alpaca Securities LLC — Options Trading Agreement",
    pdfUrl: "https://www.theocc.com/company-information/documents-and-archives/options-disclosure-document",
    pdfLabel: "Characteristics and Risks of Standardized Options (OCC)",
    inlineLinks: [
      {
        text: "www.theocc.com/company-information/documents-and-archives/options-disclosure-document",
        href: "https://www.theocc.com/company-information/documents-and-archives/options-disclosure-document",
      },
    ],
    body:
      "I hereby agree to be bound to the terms of the Options Trading Agreement as provided. I also agree that I have been presented the Characteristics and Risks of Standardized Options.\n\n" +
      "I further acknowledge and agree that:\n\n" +
      "(1) Options trading involves significant risk and may not be suitable for all investors. You may lose the entire amount invested;\n" +
      "(2) For short options positions, losses may exceed the premium received and may be theoretically unlimited for uncovered positions;\n" +
      "(3) I have received, read, and understood the Characteristics and Risks of Standardized Options (ODD) booklet published by the Options Clearing Corporation (OCC);\n" +
      "(4) Options trading access is subject to approval based on my stated experience, financial profile, and investment objectives;\n" +
      "(5) Alpaca Securities LLC reserves the right to restrict, limit, or terminate options trading privileges on my account at any time;\n" +
      "(6) I will not engage in options strategies that exceed my approved trading level;\n" +
      "(7) I understand that options are not suitable for all investors and that the OCC ODD booklet is available at www.theocc.com/company-information/documents-and-archives/options-disclosure-document.",
    checkLabel: "I agree to the Options Agreement and confirm I have received the OCC Risk Disclosure",
  },
  {
    id: "margin_agreement",
    title: "Margin Agreement",
    subtitle: "Alpaca Securities LLC — Margin Lending",
    pdfUrl: "https://files.alpaca.markets/disclosures/library/AcctAppMarginAndCustAgmt.pdf",
    pdfLabel: "View Margin Agreement PDF",
    body:
      "I authorise Alpaca Securities LLC to extend margin credit to me for the purpose of purchasing, carrying, or trading in securities in accordance with Regulation T of the Federal Reserve Board and applicable FINRA rules.\n\n" +
      "I acknowledge and agree that:\n\n" +
      "(1) Securities held in my margin account may be pledged or loaned by Alpaca as collateral for money borrowed;\n" +
      "(2) I may be required to deposit additional funds or securities (a \"margin call\") if the equity in my account falls below the required maintenance margin;\n" +
      "(3) Alpaca may liquidate any or all positions in my account without prior notice to meet a margin call or to satisfy any outstanding obligation;\n" +
      "(4) Interest will be charged on debit balances in my account at the rate disclosed in the applicable rate schedule, which may change without prior notice;\n" +
      "(5) Margin trading increases both the potential return and the potential loss on investments;\n" +
      "(6) I have read and understood the Margin Disclosure Statement provided by Alpaca Securities LLC.",
    checkLabel: "I agree to the Margin Agreement",
  },
  {
    id: "fdic_sweep",
    title: "FDIC Sweep Program Agreement",
    subtitle: "Uninvested Cash & Programme Banks",
    body:
      "Uninvested cash held in my brokerage account will be automatically swept into interest-bearing deposit accounts at one or more FDIC-insured programme banks participating in Alpaca's cash sweep programme.\n\n" +
      "I acknowledge and agree that:\n\n" +
      "(1) Swept funds are eligible for FDIC deposit insurance up to $250,000 per depositor, per insured bank, per ownership category — subject to applicable FDIC rules and the total deposits I maintain at each programme bank;\n" +
      "(2) Swept funds held at programme banks are NOT covered by SIPC protection. Only uninvested cash held directly in a brokerage account is eligible for SIPC coverage;\n" +
      "(3) Alpaca may change the list of programme banks, applicable interest rates, or sweep programme terms at any time with prior notice;\n" +
      "(4) I may opt out of the sweep programme at any time and elect to hold uninvested cash in a money market fund position, which would be eligible for SIPC coverage;\n" +
      "(5) A current list of participating programme banks is available at alpaca.markets/program-banks;\n" +
      "(6) Interest rates on swept balances may be lower than rates available on comparable products and may vary between programme banks.",
    checkLabel: "I agree to the FDIC Sweep Program Agreement",
  },
  {
    id: "account_agreement",
    title: "Account Disclosures & Consent",
    subtitle: "Electronic Delivery, Data Sharing & Regulatory Disclosures",
    body:
      "I consent to and acknowledge the following:\n\n" +
      "(1) Electronic Delivery: I consent to the electronic delivery of all account documents, trade confirmations, account statements, proxy materials, prospectuses, and regulatory disclosures. I understand I may request paper copies at any time;\n\n" +
      "(2) Data Sharing: I authorise Alpaca to share my personal and account information with clearing partners, sub-custodians, and regulatory bodies (SEC, FINRA, IRS, FinCEN) as required by applicable law;\n\n" +
      "(3) FATCA & CRS Reporting: I acknowledge that my account data will be used to fulfil reporting obligations under the Foreign Account Tax Compliance Act (FATCA) and the Common Reporting Standard (CRS);\n\n" +
      "(4) Communications Recording: I consent to the recording and monitoring of telephone calls and electronic communications for compliance, quality assurance, and dispute resolution purposes;\n\n" +
      "(5) FINRA BrokerCheck: I acknowledge receipt of the FINRA BrokerCheck disclosure. Information about Alpaca Securities LLC is available at brokercheck.finra.org;\n\n" +
      "(6) SEC Form CRS: I acknowledge receipt of Alpaca's Customer Relationship Summary (Form CRS), which describes the nature of our relationship and the services provided.",
    checkLabel: "I agree to the Account Disclosures & Consent",
  },
];

function renderBodyWithLinks(body: string, links: InlineLink[]): React.ReactNode {
  type Part = string | React.ReactElement;
  let parts: Part[] = [body];

  links.forEach(({ text, href }) => {
    const next: Part[] = [];
    parts.forEach((part) => {
      if (typeof part !== "string") {
        next.push(part);
        return;
      }
      const segments = part.split(text);
      segments.forEach((seg, i) => {
        if (seg) next.push(seg);
        if (i < segments.length - 1) {
          next.push(
            <a
              key={`${href}-${i}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-on-surface-primary break-all"
            >
              {text}
            </a>
          );
        }
      });
    });
    parts = next;
  });

  return <>{parts}</>;
}

function W8BENCard({ state }: { state: ReturnType<typeof useKYC>["state"] }) {
  const data = state.identityData;
  const fullName = data
    ? [data.firstName, data.middleName, data.lastName].filter(Boolean).join(" ")
    : "";
  const builtAddress = [
    state.addressStreet,
    state.addressUnit,
    state.addressCity,
    state.addressPostalCode,
    state.addressState,
  ]
    .filter(Boolean)
    .join(", ");
  const resolvedAddress = state.poaAddress || builtAddress || data?.address || "";

  const rows = [
    { label: "Name",                   value: fullName },
    { label: "Country of citizenship", value: data?.nationality },
    { label: "Tax ID / FTIN",          value: state.taxId || data?.idNumber },
    { label: "Date of birth",          value: data?.dateOfBirth },
  ];

  return (
    <div className="overflow-hidden rounded-10 border border-border-primary">
      {/* Form header */}
      <div className="flex items-center gap-8 px-12 py-8 bg-surface-secondary border-b border-border-primary">
        <FileText className="h-12 w-12 shrink-0 text-on-surface-tertiary" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-on-surface-tertiary">
          Form W-8BEN — pre-filled from your profile
        </p>
      </div>
      {/* 2-column grid */}
      <div className="grid grid-cols-2">
        {rows.map((row, i) => (
          <div
            key={i}
            className="flex flex-col gap-1 px-12 py-8"
            style={{
              borderBottom: "1px solid var(--color-border-primary)",
              borderRight: i % 2 === 0 ? "1px solid var(--color-border-primary)" : undefined,
            }}
          >
            <p className="text-[9px] font-semibold uppercase tracking-[0.05em] text-on-surface-tertiary">
              {row.label}
            </p>
            <p className="text-[12px] text-on-surface-primary">{row.value || "—"}</p>
          </div>
        ))}
      </div>
      {/* Full-width address row */}
      <div className="flex flex-col gap-1 px-12 py-8">
        <p className="text-[9px] font-semibold uppercase tracking-[0.05em] text-on-surface-tertiary">
          Permanent residential address
        </p>
        <p className="text-[12px] text-on-surface-primary">{resolvedAddress || "—"}</p>
      </div>
    </div>
  );
}

export default function KYCAgreements() {
  const router = useRouter();
  const { state, update } = useKYC();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [agreed, setAgreed] = useState<Record<string, boolean>>(
    Object.fromEntries(AGREEMENTS.map((a) => [a.id, false]))
  );

  const agreement = AGREEMENTS[currentIndex];
  const isLast = currentIndex === AGREEMENTS.length - 1;
  const isChecked = agreed[agreement.id];
  const agreedCount = AGREEMENTS.filter((a) => agreed[a.id]).length;

  function handleNext() {
    if (isLast) {
      update({ agreementsSigned: true, wbenAcknowledged: true });
      router.push("/kyc/complete");
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  return (
    <KYCShell
      title="Agreements"
      step={15}
      totalSteps={15}
      ctaDisabled={!isChecked}
      cta={isLast ? "Sign & submit" : "Next"}
      onCta={handleNext}
    >
      {/* Progress pill */}
      <div className="flex items-center justify-between">
        <h2 className="type-headerSm text-on-surface-primary">Review &amp; sign</h2>
        <span className="rounded-full bg-surface-secondary px-10 py-4 text-[12px] font-semibold text-on-surface-secondary">
          {agreedCount}/{AGREEMENTS.length} signed
        </span>
      </div>

      {/* Step dots */}
      <div className="mt-12 flex gap-6">
        {AGREEMENTS.map((a, i) => (
          <div
            key={a.id}
            className={cn(
              "h-6 flex-1 rounded-full transition-colors",
              agreed[a.id]
                ? "bg-success-on-light"
                : i === currentIndex
                  ? "bg-on-surface-primary"
                  : "bg-border-primary"
            )}
          />
        ))}
      </div>

      {/* Agreement card */}
      <div className={cn(
        "mt-16 overflow-hidden rounded-12 border-[1.5px]",
        isChecked ? "border-success-border" : "border-border-primary"
      )}>
        {/* Header */}
        <div className={cn(
          "px-16 py-12",
          isChecked ? "bg-success-light/30" : "bg-surface-secondary"
        )}>
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-8">
                <p className="text-[15px] font-semibold text-on-surface-primary">{agreement.title}</p>
                {agreement.tag && (
                  <span className="inline-flex h-18 items-center rounded-4 bg-accent-light px-6 text-[10px] font-semibold text-accent-on-light">
                    {agreement.tag}
                  </span>
                )}
              </div>
              <p className="mt-2 text-[12px] text-on-surface-tertiary">{agreement.subtitle}</p>
            </div>
            <span className="shrink-0 text-[11px] font-semibold text-on-surface-tertiary">
              {currentIndex + 1}/{AGREEMENTS.length}
            </span>
          </div>

          {/* PDF link */}
          {agreement.pdfUrl && (
            <a
              href={agreement.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center gap-6 rounded-8 border border-border-primary bg-surface-primary px-10 py-6 text-[12px] font-medium text-on-surface-primary hover:bg-overlay-light-hover"
            >
              <ExternalLink className="h-12 w-12 shrink-0" />
              {agreement.pdfLabel ?? "View PDF"}
            </a>
          )}
        </div>

        {/* W-8BEN pre-filled data card */}
        {agreement.id === "w8ben" && (
          <div className="border-t border-border-primary px-16 pt-14 pb-0">
            <W8BENCard state={state} />
          </div>
        )}

        {/* Full body text */}
        <div className="border-t border-border-primary px-16 py-14">
          <p className="whitespace-pre-line text-[13px] leading-[20px] text-on-surface-secondary">
            {agreement.inlineLinks
              ? renderBodyWithLinks(agreement.body, agreement.inlineLinks)
              : agreement.body}
          </p>
        </div>

        {/* Agree row */}
        <div
          role="presentation"
          onClick={() => setAgreed((prev) => ({ ...prev, [agreement.id]: !prev[agreement.id] }))}
          className="flex cursor-pointer items-start gap-12 border-t border-border-primary px-16 py-12 hover:bg-overlay-light-hover active:bg-overlay-light-pressed"
        >
          {isChecked
            ? <CheckCircle2 className="mt-1 h-18 w-18 shrink-0 text-success-on-light" />
            : <Checkbox checked={false} onChange={() => {}} />
          }
          <span className="text-[13px] leading-[20px] text-on-surface-primary">
            {agreement.checkLabel}
          </span>
        </div>
      </div>
    </KYCShell>
  );
}
