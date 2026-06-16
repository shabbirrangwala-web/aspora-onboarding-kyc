"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Info } from "lucide-react";
import { KYCShell } from "@/components/kyc/KYCShell";
import { useKYC, type KYCIdentityData } from "@/lib/kyc-store";
import { Input } from "@/components/ui/input";

const EMPTY: KYCIdentityData = {
  firstName: "", lastName: "", middleName: "", dateOfBirth: "",
  nationality: "", address: "", idNumber: "", documentType: "",
};

export default function KYCConfirm() {
  const router = useRouter();
  const { state, update, hydrated } = useKYC();

  // After hydration, redirect if no identity data
  useEffect(() => {
    if (hydrated && !state.identityData) {
      router.replace("/kyc");
    }
  }, [hydrated, state.identityData, router]);

  const data = state.identityData;
  const isEmiratesID = state.idMethod === "emirates_id";

  const [form, setForm] = useState<KYCIdentityData>(data ?? EMPTY);
  const [addressEdited, setAddressEdited] = useState(false);

  // Sync form when data loads from sessionStorage
  useEffect(() => {
    if (data) setForm({ ...data });
  }, [data]);

  // Show nothing until hydrated
  if (!hydrated || !data) return null;

  function set(field: keyof KYCIdentityData) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setForm((f) => ({ ...f, [field]: val }));
      if (field === "address" && data && val !== data.address) setAddressEdited(true);
    };
  }

  // Emirates ID always needs PoA (no address on card)
  const noAddress = !form.address?.trim();
  const poaNeeded = isEmiratesID || state.poaRequired || addressEdited || noAddress;

  function handleContinue() {
    update({ identityData: form, poaRequired: poaNeeded });
    router.push(poaNeeded ? "/kyc/address" : "/kyc/tax");
  }

  return (
    <KYCShell
      title="Review details"
      step={4}
      cta="Confirm"
      onCta={handleContinue}
    >
      <h2 className="type-headerSm text-on-surface-primary">Is everything correct?</h2>
      <p className="mt-8 type-bodySm text-on-surface-secondary">
        Fetched from your{" "}
        <span className="font-semibold text-on-surface-primary">{data.documentType}</span>.
        Edit anything that&apos;s incorrect before confirming.
      </p>

      <div className="mt-24 flex flex-col gap-16">
        <div className="flex gap-12">
          <div className="flex-1">
            <Input label="First name" value={form.firstName} onChange={set("firstName")} />
          </div>
          <div className="flex-1">
            <Input label="Last name" value={form.lastName} onChange={set("lastName")} />
          </div>
        </div>

        <Input label="Middle name" value={form.middleName} onChange={set("middleName")} optional />
        <Input label="Date of birth" value={form.dateOfBirth} onChange={set("dateOfBirth")} placeholder="YYYY-MM-DD" />
        <Input label="Nationality" value={form.nationality} onChange={set("nationality")} />

        {data.idNumber && (
          <Input label="Document number" value={form.idNumber} disabled />
        )}

        {isEmiratesID ? (
          /* Emirates ID does not carry address — always ask for PoA */
          <div className="flex items-start gap-8 rounded-12 bg-surface-secondary p-12">
            <Info className="mt-0.5 h-16 w-16 shrink-0 text-on-surface-secondary" />
            <p className="text-[12px] leading-[18px] text-on-surface-secondary">
              <span className="font-semibold text-on-surface-primary">Address not on Emirates ID.</span>{" "}
              You&apos;ll upload a proof of address on the next step and confirm the address shown on that document.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <Input
              label="Residential address"
              value={form.address}
              onChange={set("address")}
              placeholder="Enter your full address"
              helper={
                noAddress
                  ? "No address on this document — proof of address required"
                  : addressEdited
                    ? "Address edited — proof of address will be required"
                    : undefined
              }
            />
            {(noAddress || addressEdited) && (
              <div className="flex items-start gap-8 rounded-12 bg-warning-light p-12">
                <AlertTriangle className="mt-0.5 h-16 w-16 shrink-0 text-warning-on-light" />
                <p className="text-[12px] leading-[18px] text-warning-on-light">
                  {noAddress
                    ? "No address was found on this document. You'll need to upload a proof of address on the next step."
                    : "You've changed the address. We'll ask you to upload a proof of address."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </KYCShell>
  );
}
