"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Fingerprint, CreditCard, BookOpen, IdCard, Car, Hash } from "lucide-react";
import { KYCShell } from "@/components/kyc/KYCShell";
import { useKYC, KYCIDMethod, requiresPoA } from "@/lib/kyc-store";
import { cn } from "@/lib/utils";

interface Method {
  id: KYCIDMethod;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  tag?: string;
  warning?: string;
}

const UAE_METHODS: Method[] = [
  {
    id: "uaepass",
    icon: CreditCard,
    title: "UAEPass",
    description: "Redirect to UAEPass — auto-fetches your Emirates ID data",
    tag: "Fastest",
  },
  {
    id: "efr",
    icon: Fingerprint,
    title: "Emirates Face Recognition (EFR)",
    description: "Redirect to the EFR platform — verifies via ICP biometric database",
  },
  {
    id: "emirates_id",
    icon: IdCard,
    title: "Emirates ID",
    description: "Scan and upload your Emirates ID card",
    warning: "Proof of address will be required",
  },
  {
    id: "passport",
    icon: BookOpen,
    title: "Passport",
    description: "Upload your passport (any country)",
    warning: "Proof of address will be required",
  },
];

const UK_METHODS: Method[] = [
  {
    id: "driving_licence",
    icon: Car,
    title: "UK Driving Licence",
    description: "Upload your photocard driving licence — includes your address",
    tag: "Recommended",
  },
  {
    id: "brp",
    icon: IdCard,
    title: "Biometric Residence Permit (BRP)",
    description: "Scan your BRP card — name, DOB and photo are extracted automatically",
    warning: "Proof of address will be required",
  },
  {
    id: "share_code",
    icon: Hash,
    title: "UK Share Code",
    description: "Enter your Home Office share code to prove your UK immigration status",
    warning: "Proof of address will be required",
  },
  {
    id: "passport",
    icon: BookOpen,
    title: "Passport",
    description: "Upload your passport (any country)",
    warning: "Proof of address will be required",
  },
];

function MethodCard({
  method,
  selected,
  onSelect,
}: {
  method: Method;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = method.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-16 border-[1.5px] p-16 text-left transition-all",
        selected
          ? "border-on-surface-primary bg-surface-secondary"
          : "border-border-primary hover:bg-overlay-light-hover active:bg-overlay-light-pressed"
      )}
    >
      <div className="flex items-start gap-12">
        <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-12 bg-surface-tertiary">
          <Icon className="h-20 w-20 text-on-surface-primary" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-8">
            <span className="text-[14px] font-semibold leading-[20px] tracking-[-0.006em] text-on-surface-primary">
              {method.title}
            </span>
            {method.tag && (
              <span className="inline-flex h-20 items-center rounded-4 bg-accent-light px-6 text-[11px] font-semibold leading-none tracking-[0.01em] text-accent-on-light">
                {method.tag}
              </span>
            )}
          </div>
          <p className="mt-4 text-[13px] leading-[18px] text-on-surface-secondary">
            {method.description}
          </p>
          {method.warning && (
            <div className="mt-8 flex items-center gap-4">
              <AlertTriangle className="h-12 w-12 shrink-0 text-warning-on-light" />
              <span className="text-[11px] leading-[16px] text-warning-on-light">{method.warning}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

export default function KYCIdentity() {
  const router = useRouter();
  const { state, update } = useKYC();
  const [selected, setSelected] = useState<KYCIDMethod | null>(state.idMethod);

  const methods = state.country === "uae" ? UAE_METHODS : UK_METHODS;
  const countryLabel = state.country === "uae" ? "UAE" : "UK";

  function handleContinue() {
    if (!selected || !state.country) return;
    const poa = requiresPoA(state.country, selected);
    update({ idMethod: selected, poaRequired: poa });

    if (state.country === "uae") {
      if (selected === "uaepass") router.push("/kyc/identity/uaepass");
      else if (selected === "efr") router.push("/kyc/identity/efr");
      else router.push("/kyc/identity/document");
    } else {
      if (selected === "share_code") router.push("/kyc/identity/share-code");
      else router.push("/kyc/identity/document");
    }
  }

  return (
    <KYCShell
      title="Identity"
      step={2}
      totalSteps={13}
      ctaDisabled={!selected}
      onCta={handleContinue}
    >
      <h2 className="type-headerSm text-on-surface-primary">How would you like to verify?</h2>
      <p className="mt-8 type-bodySm text-on-surface-secondary">
        {state.country === "uae"
          ? "UAEPass and EFR redirect to UAE government platforms and fetch your data automatically — no manual entry."
          : "Choose a document. A driving licence includes your address. BRP, Share Code, and passport require proof of address in the next step."}
      </p>

      <div className="mt-8 inline-flex items-center gap-6 rounded-8 bg-surface-secondary px-10 py-6">
        <span className="text-[12px] font-medium text-on-surface-secondary">Country:</span>
        <span className="text-[12px] font-semibold text-on-surface-primary">{countryLabel} resident</span>
      </div>

      <div className="mt-20 flex flex-col gap-12">
        {methods.map((m) => (
          <MethodCard
            key={m.id}
            method={m}
            selected={selected === m.id}
            onSelect={() => setSelected(m.id)}
          />
        ))}
      </div>
    </KYCShell>
  );
}
