"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { KYCShell } from "@/components/kyc/KYCShell";
import { useKYC } from "@/lib/kyc-store";
import { Checkbox } from "@/components/ui/checkbox";

type Step = 1 | 2;

function FormRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-12 py-6" style={{ borderBottom: "1px solid var(--color-border-primary)" }}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-on-surface-tertiary shrink-0">{label}</p>
      <p className="text-[12px] text-on-surface-primary text-right">{value || "—"}</p>
    </div>
  );
}

export default function KYCWben() {
  const router = useRouter();
  const { state, update } = useKYC();
  const [step, setStep] = useState<Step>(1);
  const [certChecked, setCertChecked] = useState(false);
  const [ackChecked, setAckChecked] = useState(false);

  const data = state.identityData;
  const fullName = data
    ? [data.firstName, data.middleName, data.lastName].filter(Boolean).join(" ")
    : "";

  // Build the best available address — prefer PoA / manually entered sub-fields
  // over the raw identity document address (which is blank for passport/BRP/share-code flows)
  const builtAddress = [
    state.addressStreet,
    state.addressUnit,
    state.addressCity,
    state.addressPostalCode,
    state.addressState,
  ]
    .filter(Boolean)
    .join(", ");
  const resolvedAddress =
    state.poaAddress || builtAddress || data?.address || "";

  if (step === 1) {
    return (
      <KYCShell
        title="W-8BEN"
        step={5}
        cta="Continue"
        ctaDisabled={!certChecked}
        onCta={() => setStep(2)}
      >
        <div className="flex items-center gap-12 rounded-16 bg-surface-secondary p-16">
          <FileText className="h-32 w-32 shrink-0 text-on-surface-secondary" />
          <div>
            <p className="text-[14px] font-semibold text-on-surface-primary">W-8BEN</p>
            <p className="mt-2 text-[12px] text-on-surface-secondary">
              Certificate of Foreign Status — required for all non-US investors in US securities
            </p>
          </div>
        </div>

        <h2 className="mt-24 type-headerSm text-on-surface-primary">Foreign status certification</h2>
        <p className="mt-8 type-bodySm text-on-surface-secondary">
          Please read and acknowledge the following before signing.
        </p>

        <div className="mt-16 rounded-12 border-[1.5px] border-border-primary p-16">
          <p className="text-[13px] italic leading-[20px] text-on-surface-primary">
            &ldquo;I certify that I am not a US citizen, US resident alien or other US person for US tax purposes, and I am submitting the applicable Form W-8BEN with this form to certify my foreign status and, if applicable, claim tax treaty benefits.&rdquo;
          </p>
        </div>

        <div className="mt-16">
          <Checkbox
            checked={certChecked}
            onChange={setCertChecked}
            label="I certify my foreign status as stated above"
          />
        </div>
      </KYCShell>
    );
  }

  return (
    <KYCShell
      title="W-8BEN"
      step={5}
      cta="Sign W-8BEN"
      ctaDisabled={!ackChecked}
      onCta={() => {
        update({ wbenAcknowledged: true });
        router.push("/kyc/financial");
      }}
    >
      <h2 className="type-headerSm text-on-surface-primary">Sign under penalty of perjury</h2>
      <p className="mt-8 type-bodySm text-on-surface-secondary">
        Review your details below. By signing, you certify this information is true, correct, and complete.
      </p>

      {/* W-8BEN pre-populated form fields — compact */}
      <div className="mt-16 overflow-hidden rounded-12 border-[1.5px] border-border-primary">
        <div className="flex items-center gap-8 px-12 py-8 bg-surface-secondary">
          <FileText className="h-12 w-12 shrink-0 text-on-surface-tertiary" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-on-surface-tertiary">
            Form W-8BEN — Certificate of Foreign Status
          </p>
        </div>
        <div className="grid grid-cols-2 gap-0">
          {[
            { label: "Name",                   value: fullName },
            { label: "Country of citizenship", value: data?.nationality },
            { label: "Tax ID / FTIN",          value: state.taxId || data?.idNumber },
            { label: "Date of birth",          value: data?.dateOfBirth },
          ].map((row, i) => (
            <div key={i} className="flex flex-col gap-1 px-12 py-8" style={{ borderTop: "1px solid var(--color-border-primary)", borderRight: i % 2 === 0 ? "1px solid var(--color-border-primary)" : undefined }}>
              <p className="text-[9px] font-semibold uppercase tracking-[0.05em] text-on-surface-tertiary">{row.label}</p>
              <p className="text-[12px] text-on-surface-primary">{row.value || "—"}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1 px-12 py-8" style={{ borderTop: "1px solid var(--color-border-primary)" }}>
          <p className="text-[9px] font-semibold uppercase tracking-[0.05em] text-on-surface-tertiary">Permanent residential address</p>
          <p className="text-[12px] text-on-surface-primary">{resolvedAddress || "—"}</p>
        </div>
      </div>

      {/* Perjury declaration */}
      <div className="mt-16 max-h-[160px] overflow-y-auto rounded-12 border-[1.5px] border-border-primary p-16">
        <p className="text-[12px] leading-[18px] text-on-surface-secondary">
          I declare that I have examined the information on this form and to the best of my knowledge and belief it is true, correct, and complete. I further certify under penalties of perjury that: (1) I am the individual that is the beneficial owner of all the income to which this form relates; (2) The person named on line 1 of this form is not a U.S. person; (3) This form relates to income not effectively connected with the conduct of a trade or business in the United States; (4) The income to which this form relates is not subject to backup withholding; (5) I consent to electronic delivery of this form and acknowledge that my electronic signature has the same legal effect as a handwritten signature.
        </p>
      </div>

      <div className="mt-16">
        <Checkbox
          checked={ackChecked}
          onChange={setAckChecked}
          label="I confirm the above details are correct and agree to the declaration"
        />
      </div>

      <div className="mt-16 rounded-12 bg-surface-secondary p-12">
        <p className="text-[11px] leading-[16px] text-on-surface-tertiary">
          Your W-8BEN must be renewed every 3 years per IRS requirements. Your IP address and timestamp will be recorded at the point of signing.
        </p>
      </div>
    </KYCShell>
  );
}
