"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KYCShell } from "@/components/kyc/KYCShell";
import { useKYC } from "@/lib/kyc-store";
import { Input } from "@/components/ui/input";

export default function KYCContact() {
  const router = useRouter();
  const { state, update } = useKYC();

  const [middleName, setMiddleName] = useState(state.identityData?.middleName ?? "");
  const [email, setEmail] = useState(state.contactEmail ?? "");
  const [phone, setPhone] = useState(state.contactPhone ?? "");

  const canContinue = !!email.trim() && !!phone.trim();

  function handleContinue() {
    update({
      contactEmail: email.trim(),
      contactPhone: phone.trim(),
      ...(state.identityData && {
        identityData: { ...state.identityData, middleName: middleName.trim() },
      }),
    });
    router.push("/kyc/personal");
  }

  return (
    <KYCShell
      title="Contact details"
      step={6}
      totalSteps={15}
      ctaDisabled={!canContinue}
      onCta={handleContinue}
    >
      <h2 className="type-headerSm text-on-surface-primary">Contact details</h2>
      <p className="mt-8 type-bodySm text-on-surface-secondary">
        Required by Alpaca Securities to open and manage your account.
      </p>

      <div className="mt-24 flex flex-col gap-16">
        <Input
          label="Middle name"
          placeholder="e.g. Faiyaz Ali"
          value={middleName}
          onChange={(e) => setMiddleName(e.target.value)}
          optional
          helper="As it appears on your government-issued ID"
        />

        <Input
          label="Email address"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Phone number"
          placeholder="+44 7700 900000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          helper="Include country code, e.g. +971 for UAE"
        />
      </div>

      <div className="mt-20 rounded-12 bg-surface-secondary p-12">
        <p className="text-[12px] leading-[18px] text-on-surface-secondary">
          <span className="font-semibold text-on-surface-primary">Why we need this:</span>{" "}
          Your email is used for account notifications and regulatory communications. Your phone number is required for two-factor authentication and account security.
        </p>
      </div>
    </KYCShell>
  );
}
