"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { KYCShell } from "@/components/kyc/KYCShell";
import { useKYC } from "@/lib/kyc-store";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function KYCAffiliationDisclosure() {
  const router = useRouter();
  const { state, update } = useKYC();

  const isControlPerson = state.declarations?.controlPerson ?? false;

  // Company details
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [complianceEmail, setComplianceEmail] = useState("");
  const [tickerSymbol, setTickerSymbol] = useState("");

  // Compliance letter upload
  const [letterUploaded, setLetterUploaded] = useState(false);

  // Firm duplicate statements
  const [firmRequiresDuplicates, setFirmRequiresDuplicates] = useState<boolean | null>(null);
  const [ipFirstName, setIpFirstName] = useState("");
  const [ipLastName, setIpLastName] = useState("");
  const [ipTitle, setIpTitle] = useState("");
  const [ipEmail, setIpEmail] = useState("");
  const [ipPhone, setIpPhone] = useState("");

  // Show/collapse letter requirements
  const [showLetterReqs, setShowLetterReqs] = useState(false);

  const duplicateFieldsFilled =
    !firmRequiresDuplicates ||
    (!!ipFirstName && !!ipLastName && !!ipEmail);

  const canContinue =
    !!companyName &&
    !!companyAddress &&
    !!complianceEmail &&
    (!isControlPerson || !!tickerSymbol) &&
    letterUploaded &&
    firmRequiresDuplicates !== null &&
    duplicateFieldsFilled;

  function handleContinue() {
    update({
      affiliationData: {
        companyName,
        companyAddress,
        complianceEmail,
        tickerSymbol,
        letterUploaded,
        firmRequiresDuplicates: firmRequiresDuplicates ?? false,
        interestedPartyFirstName: ipFirstName,
        interestedPartyLastName: ipLastName,
        interestedPartyTitle: ipTitle,
        interestedPartyEmail: ipEmail,
        interestedPartyPhone: ipPhone,
      },
    });
    router.push("/kyc/screening");
  }

  return (
    <KYCShell
      title="Affiliated person"
      step={12}
      totalSteps={15}
      ctaDisabled={!canContinue}
      cta="Submit disclosure"
      onCta={handleContinue}
    >
      <h2 className="type-headerSm text-on-surface-primary">Affiliated person disclosure</h2>
      <p className="mt-8 type-bodySm text-on-surface-secondary">
        Under FINRA Rule 3210, affiliated persons must obtain written permission from their employer before opening a brokerage account.
      </p>

      {/* Requirement banner */}
      <div className="mt-16 rounded-12 border-[1.5px] border-warning-border bg-warning-light p-12">
        <div className="flex items-start gap-8">
          <AlertTriangle className="mt-0.5 h-14 w-14 shrink-0 text-warning-on-light" />
          <p className="text-[12px] leading-[18px] text-warning-on-light">
            <span className="font-semibold">Compliance letter required.</span> Your employer&apos;s compliance officer must provide a letter on company letterhead explicitly granting permission to carry this account.
          </p>
        </div>
      </div>

      {/* What the letter must include */}
      <div className="mt-12 overflow-hidden rounded-12 border-[1.5px] border-border-primary">
        <button
          type="button"
          onClick={() => setShowLetterReqs((v) => !v)}
          className="flex w-full items-center justify-between px-14 py-12 text-left hover:bg-overlay-light-hover transition-colors"
        >
          <span className="text-[13px] font-semibold text-on-surface-primary">What the letter must include</span>
          {showLetterReqs
            ? <ChevronUp className="h-16 w-16 text-on-surface-tertiary" />
            : <ChevronDown className="h-16 w-16 text-on-surface-tertiary" />}
        </button>
        {showLetterReqs && (
          <div className="border-t border-border-primary bg-surface-secondary px-14 py-12">
            <ul className="flex flex-col gap-8">
              {[
                "Written on company letterhead and signed by a compliance officer",
                "Explicit permission for the applicant to carry the account",
                "Clear statement on whether the firm requires duplicate statements and/or trade confirmations",
                isControlPerson
                  ? "Company name, address, compliance email and ticker symbol"
                  : "Company name, address, and compliance email address",
                "If duplicates are required: the interested party's full name, title, email address, and phone number",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-8">
                  <span className="mt-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface-tertiary text-[9px] font-bold text-on-surface-tertiary">
                    {i + 1}
                  </span>
                  <span className="text-[12px] leading-[18px] text-on-surface-secondary">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ── Company details ── */}
      <div className="mt-24 flex flex-col gap-16">
        <p className="text-[13px] font-semibold text-on-surface-primary">Firm details</p>

        <Input
          label="Company / firm name"
          placeholder="Goldman Sachs & Co."
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
        <Input
          label="Company address"
          placeholder="200 West Street, New York, NY 10282"
          value={companyAddress}
          onChange={(e) => setCompanyAddress(e.target.value)}
        />
        <Input
          label="Compliance officer email"
          placeholder="compliance@firm.com"
          value={complianceEmail}
          onChange={(e) => setComplianceEmail(e.target.value)}
        />
        {isControlPerson && (
          <Input
            label="Ticker symbol"
            placeholder="e.g. GS"
            value={tickerSymbol}
            onChange={(e) => setTickerSymbol(e.target.value.toUpperCase())}
            helper="Required for publicly traded companies"
          />
        )}
      </div>

      {/* ── Upload letter ── */}
      <div className="mt-24 flex flex-col gap-8">
        <p className="text-[13px] font-semibold text-on-surface-primary">Upload compliance letter</p>
        <p className="text-[12px] text-on-surface-tertiary">PDF only · document type: <span className="font-mono text-[11px]">account_approval_letter</span></p>
        <button
          type="button"
          onClick={() => setLetterUploaded(true)}
          className={cn(
            "flex h-[120px] w-full flex-col items-center justify-center gap-8 rounded-16 border-[1.5px] border-dashed transition-all",
            letterUploaded
              ? "border-success-border bg-success-light"
              : "border-border-primary hover:border-on-surface-primary hover:bg-overlay-light-hover active:bg-overlay-light-pressed"
          )}
        >
          {letterUploaded ? (
            <>
              <CheckCircle2 className="h-24 w-24 text-success-on-light" />
              <span className="text-[13px] font-semibold text-success-on-light">Letter uploaded ✓</span>
            </>
          ) : (
            <>
              <Camera className="h-24 w-24 text-on-surface-tertiary" />
              <span className="text-[13px] font-medium text-on-surface-secondary">Tap to upload PDF</span>
            </>
          )}
        </button>
      </div>

      {/* ── Duplicate statements ── */}
      <div className="mt-24 flex flex-col gap-8">
        <p className="text-[13px] font-semibold text-on-surface-primary">
          Does your firm require access to duplicate statements or trade confirmations?
        </p>
        <div className="flex gap-8">
          {[
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ].map(({ value, label }) => (
            <button
              key={String(value)}
              type="button"
              onClick={() => setFirmRequiresDuplicates(value)}
              className={cn(
                "flex flex-1 items-center justify-center rounded-8 border-[1.5px] py-10 text-[13px] font-medium transition-all",
                firmRequiresDuplicates === value
                  ? "border-on-surface-primary bg-on-surface-primary text-surface-primary"
                  : "border-border-primary text-on-surface-secondary hover:bg-overlay-light-hover"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Interested party fields — shown only when firm requires duplicates */}
      {firmRequiresDuplicates === true && (
        <div className="mt-16 flex flex-col gap-12">
          <div className="rounded-12 bg-surface-secondary p-12">
            <p className="text-[12px] leading-[18px] text-on-surface-secondary">
              Provide the details of the compliance contact at your firm who will receive account access.
            </p>
          </div>
          <div className="flex gap-12">
            <div className="flex-1">
              <Input
                label="First name"
                placeholder="Jane"
                value={ipFirstName}
                onChange={(e) => setIpFirstName(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Input
                label="Last name"
                placeholder="Smith"
                value={ipLastName}
                onChange={(e) => setIpLastName(e.target.value)}
              />
            </div>
          </div>
          <Input
            label="Title"
            placeholder="Chief Compliance Officer"
            value={ipTitle}
            onChange={(e) => setIpTitle(e.target.value)}
            optional
          />
          <Input
            label="Email address"
            placeholder="jane.smith@firm.com"
            value={ipEmail}
            onChange={(e) => setIpEmail(e.target.value)}
          />
          <Input
            label="Phone number"
            placeholder="+1 212 555 0100"
            value={ipPhone}
            onChange={(e) => setIpPhone(e.target.value)}
            optional
          />
        </div>
      )}

      {firmRequiresDuplicates === false && (
        <div className="mt-12 rounded-12 bg-surface-secondary p-12">
          <p className="text-[12px] leading-[18px] text-on-surface-secondary">
            Your firm does not require duplicate access. Ensure this is explicitly stated in the compliance letter.
          </p>
        </div>
      )}
    </KYCShell>
  );
}
