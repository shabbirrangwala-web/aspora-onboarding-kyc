"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, CheckCircle2, FileText, MapPin } from "lucide-react";
import { KYCShell } from "@/components/kyc/KYCShell";
import { useKYC } from "@/lib/kyc-store";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const DOC_TYPES = [
  { id: "bank", icon: FileText, label: "Bank statement", hint: "Dated within the last 30 days" },
  { id: "utility", icon: FileText, label: "Utility bill", hint: "Dated within the last 30 days" },
  { id: "lease", icon: FileText, label: "Rental / lease agreement", hint: "Current tenancy" },
];

// Mock address extracted from PoA document
const MOCK_POA_ADDRESS = "Villa 12, Al Barsha 2, Dubai, UAE 00000";

export default function KYCAddress() {
  const router = useRouter();
  const { update } = useKYC();
  const [docType, setDocType] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState(false);
  const [step, setStep] = useState<"upload" | "confirm">("upload");

  // Split address fields — street pre-filled from extraction
  const [street, setStreet] = useState(MOCK_POA_ADDRESS);
  const [unit, setUnit] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [addressState, setAddressState] = useState("");

  function handleUploadConfirm() {
    setStep("confirm");
  }

  function handleAddressConfirm() {
    update({
      poaCompleted: true,
      poaAddress: [street, unit, city, postalCode, addressState].filter(Boolean).join(", "),
      addressStreet: street.trim(),
      addressUnit: unit.trim(),
      addressCity: city.trim(),
      addressPostalCode: postalCode.trim(),
      addressState: addressState.trim(),
    });
    router.push("/kyc/tax");
  }

  if (step === "confirm") {
    return (
      <KYCShell
        title="Proof of address"
        step={5}
        cta="Confirm address"
        ctaDisabled={!street.trim()}
        onCta={handleAddressConfirm}
      >
        <h2 className="type-headerSm text-on-surface-primary">Confirm your address</h2>
        <p className="mt-8 type-bodySm text-on-surface-secondary">
          We extracted the following address from your document. Fill in any missing fields and correct if needed.
        </p>

        <div className="mt-20 rounded-12 bg-surface-secondary p-12 flex items-start gap-8">
          <CheckCircle2 className="mt-0.5 h-16 w-16 shrink-0 text-success-on-light" />
          <p className="text-[12px] leading-[18px] text-on-surface-secondary">
            <span className="font-semibold text-on-surface-primary">Document uploaded successfully.</span>{" "}
            Address extracted from your {DOC_TYPES.find((d) => d.id === docType)?.label ?? "document"}.
          </p>
        </div>

        <div className="mt-20 flex flex-col gap-12">
          <Input
            label="Street address"
            placeholder="123 Main Street"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
          />
          <Input
            label="Unit / Apt #"
            placeholder="Apt 4B"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            optional
          />
          <div className="flex gap-12">
            <div className="flex-1">
              <Input
                label="City"
                placeholder="Dubai"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                optional
              />
            </div>
            <div className="flex-1">
              <Input
                label="Postal code"
                placeholder="00000"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                optional
              />
            </div>
          </div>
          <Input
            label="State / Province"
            placeholder="e.g. Dubai"
            value={addressState}
            onChange={(e) => setAddressState(e.target.value)}
            optional
          />
        </div>

        <div className="mt-16 rounded-12 bg-surface-secondary p-12">
          <p className="text-[12px] leading-[18px] text-on-surface-secondary">
            <span className="font-semibold text-on-surface-primary">Name matching:</span>{" "}
            The name on your document was matched against your identity. Minor variations are okay; significant mismatches will trigger a manual review.
          </p>
        </div>
      </KYCShell>
    );
  }

  return (
    <KYCShell
      title="Proof of address"
      step={5}
      ctaDisabled={!uploaded}
      onCta={handleUploadConfirm}
    >
      <h2 className="type-headerSm text-on-surface-primary">Upload proof of address</h2>
      <p className="mt-8 type-bodySm text-on-surface-secondary">
        One document is required. It must show your full legal name and current residential address, and be dated within the last 30 days.
      </p>

      <div className="mt-12 rounded-12 bg-surface-secondary p-12">
        <p className="text-[12px] leading-[18px] text-on-surface-secondary">
          <span className="font-semibold text-on-surface-primary">Name matching:</span>{" "}
          The name on this document must closely match your identity document. Minor variations are okay; significant mismatches will trigger a manual review.
        </p>
      </div>

      <div className="mt-24 flex flex-col gap-8">
        <p className="text-[12px] font-semibold text-on-surface-secondary">Select document type</p>
        {DOC_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => { setDocType(t.id); setUploaded(false); }}
            className={cn(
              "flex items-center gap-12 rounded-12 border-[1.5px] px-16 py-12 text-left transition-all",
              docType === t.id
                ? "border-on-surface-primary bg-surface-secondary"
                : "border-border-primary hover:bg-overlay-light-hover"
            )}
          >
            <t.icon className="h-16 w-16 shrink-0 text-on-surface-secondary" />
            <div>
              <span className="text-[14px] font-medium text-on-surface-primary">{t.label}</span>
              <p className="text-[12px] text-on-surface-tertiary">{t.hint}</p>
            </div>
          </button>
        ))}
      </div>

      {docType && (
        <button
          type="button"
          onClick={() => setUploaded(true)}
          className={cn(
            "mt-16 flex h-[120px] w-full flex-col items-center justify-center gap-8 rounded-16 border-[1.5px] border-dashed transition-all",
            uploaded
              ? "border-success-border bg-success-light"
              : "border-border-primary hover:border-on-surface-primary hover:bg-overlay-light-hover active:bg-overlay-light-pressed"
          )}
        >
          {uploaded ? (
            <>
              <CheckCircle2 className="h-24 w-24 text-success-on-light" />
              <span className="text-[13px] font-semibold text-success-on-light">Document uploaded ✓</span>
            </>
          ) : (
            <>
              <Camera className="h-24 w-24 text-on-surface-tertiary" />
              <span className="text-[13px] font-medium text-on-surface-secondary">Tap to upload document</span>
            </>
          )}
        </button>
      )}

      {uploaded && (
        <div className="mt-12 flex items-center gap-8 rounded-12 bg-surface-secondary p-12">
          <MapPin className="h-16 w-16 shrink-0 text-on-surface-tertiary" />
          <p className="text-[12px] leading-[18px] text-on-surface-secondary">
            We&apos;ll extract and show your address from this document on the next screen for you to confirm.
          </p>
        </div>
      )}
    </KYCShell>
  );
}
