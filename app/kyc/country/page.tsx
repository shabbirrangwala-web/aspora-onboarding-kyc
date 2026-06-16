"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KYCShell } from "@/components/kyc/KYCShell";
import { useKYC, type KYCCountry } from "@/lib/kyc-store";
import { cn } from "@/lib/utils";

const COUNTRIES: { id: KYCCountry; flag: string; name: string; hint: string }[] = [
  { id: "uae", flag: "🇦🇪", name: "United Arab Emirates", hint: "Dubai, Abu Dhabi, Sharjah, etc." },
  { id: "uk", flag: "🇬🇧", name: "United Kingdom", hint: "England, Scotland, Wales, N. Ireland" },
];

export default function KYCCountry() {
  const router = useRouter();
  const { state, update } = useKYC();
  const [selected, setSelected] = useState<KYCCountry | null>(state.country);

  return (
    <KYCShell
      title="Country of residence"
      step={1}
      ctaDisabled={!selected}
      onCta={() => {
        update({ country: selected! });
        router.push("/kyc/identity");
      }}
    >
      <h2 className="type-headerSm text-on-surface-primary">Where do you currently live?</h2>
      <p className="mt-8 type-bodySm text-on-surface-secondary">
        Your country of residence determines the documents and checks required.
      </p>

      <div className="mt-24 flex flex-col gap-12">
        {COUNTRIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelected(c.id)}
            className={cn(
              "flex items-center gap-16 rounded-16 border-[1.5px] p-16 text-left transition-all",
              selected === c.id
                ? "border-on-surface-primary bg-surface-secondary"
                : "border-border-primary hover:bg-overlay-light-hover active:bg-overlay-light-pressed"
            )}
          >
            <span className="text-[32px] leading-none">{c.flag}</span>
            <div className="flex flex-1 flex-col gap-2">
              <span className="text-[14px] font-semibold leading-[20px] text-on-surface-primary">{c.name}</span>
              <span className="text-[13px] leading-[18px] text-on-surface-secondary">{c.hint}</span>
            </div>
            <div
              className={cn(
                "flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-all",
                selected === c.id
                  ? "border-on-surface-primary bg-on-surface-primary"
                  : "border-border-primary"
              )}
            >
              {selected === c.id && (
                <div className="h-8 w-8 rounded-full bg-surface-primary" />
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-24 rounded-12 bg-surface-secondary p-16">
        <p className="text-[12px] leading-[18px] text-on-surface-secondary">
          <span className="font-medium text-on-surface-primary">Note:</span> Your risk classification is based on country of residence, not nationality. Prohibited countries (Russia, Iran, Belarus, Brazil, Canada, Serbia, Ukraine) cannot proceed.
        </p>
      </div>
    </KYCShell>
  );
}
