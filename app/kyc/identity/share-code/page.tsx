"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Info } from "lucide-react";
import { KYCShell } from "@/components/kyc/KYCShell";
import { useKYC, MOCK_DATA } from "@/lib/kyc-store";
import { Input } from "@/components/ui/input";
import { CircularLoader } from "@/components/ui/circular-loader";

type Stage = "entry" | "checking" | "done";

export default function KYCShareCode() {
  const router = useRouter();
  const { update } = useKYC();
  const [shareCode, setShareCode] = useState("");
  const [stage, setStage] = useState<Stage>("entry");

  // Format input as groups of 3 separated by dash: W3X-K9M-R2P
  function handleCodeChange(raw: string) {
    const clean = raw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 9);
    const parts = [clean.slice(0, 3), clean.slice(3, 6), clean.slice(6, 9)].filter(Boolean);
    setShareCode(parts.join("-"));
  }

  const codeComplete = shareCode.replace(/-/g, "").length === 9;

  function handleCheck() {
    setStage("checking");
    setTimeout(() => {
      update({ identityData: MOCK_DATA.share_code });
      setStage("done");
    }, 2500);
  }

  if (stage === "checking") {
    return (
      <KYCShell title="Share Code" step={3} totalSteps={13}>
        <div className="flex flex-col items-center py-48 text-center">
          <CircularLoader size="xlarge" type="ring" />
          <h2 className="mt-24 type-headerSm text-on-surface-primary">Checking your share code…</h2>
          <p className="mt-8 type-bodySm text-on-surface-secondary">
            Verifying your immigration status with the Home Office. This takes a moment.
          </p>
        </div>
      </KYCShell>
    );
  }

  if (stage === "done") {
    const data = MOCK_DATA.share_code;
    return (
      <KYCShell
        title="Share Code"
        step={3}
        totalSteps={13}
        cta="Continue to selfie"
        onCta={() => router.push("/kyc/selfie")}
      >
        <div className="flex flex-col items-center pt-32 text-center">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <div className="flex h-80 w-80 items-center justify-center rounded-full bg-success-light">
              <CheckCircle2 className="h-40 w-40 text-success-on-light" />
            </div>
          </motion.div>
          <h2 className="mt-24 type-headerSm text-on-surface-primary">Status confirmed</h2>
          <p className="mt-8 type-bodySm text-on-surface-secondary">
            Your UK immigration status has been verified via the Home Office.
          </p>
        </div>

        <div className="mt-24 overflow-hidden rounded-12 border-[1.5px] border-border-primary">
          {[
            { label: "Full name", value: `${data.firstName} ${data.lastName}` },
            { label: "Date of birth", value: data.dateOfBirth },
            { label: "Document", value: data.documentType },
            { label: "Share code", value: shareCode },
          ].map((row, i, arr) => (
            <div
              key={row.label}
              className="flex items-center justify-between px-16 py-12"
              style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--color-border-primary)" : undefined }}
            >
              <span className="text-[12px] text-on-surface-tertiary">{row.label}</span>
              <span className="text-[13px] font-medium text-on-surface-primary">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-12 flex items-start gap-8 rounded-12 bg-warning-light p-12">
          <Info className="mt-0.5 h-14 w-14 shrink-0 text-warning-on-light" />
          <p className="text-[12px] leading-[18px] text-warning-on-light">
            Your address was not retrieved from the share code. You will be asked to upload a proof of address in the next step.
          </p>
        </div>
      </KYCShell>
    );
  }

  return (
    <KYCShell
      title="Share Code"
      step={3}
      totalSteps={13}
      cta="Check code"
      ctaDisabled={!codeComplete}
      onCta={handleCheck}
    >
      <h2 className="type-headerSm text-on-surface-primary">Enter your share code</h2>
      <p className="mt-8 type-bodySm text-on-surface-secondary">
        Your 9-character share code is issued by the UK Home Office to prove your immigration status. You can find it at{" "}
        <span className="font-medium text-on-surface-primary">gov.uk/view-prove-immigration-status</span>.
      </p>

      <div className="mt-24">
        <Input
          label="Share code"
          placeholder="W3X-K9M-R2P"
          value={shareCode}
          onChange={(e) => handleCodeChange(e.target.value)}
          helper="Format: 3 letters/digits, dash, 3 letters/digits, dash, 3 letters/digits"
        />
      </div>

      <div className="mt-16 rounded-12 bg-surface-secondary p-12">
        <p className="text-[12px] font-semibold text-on-surface-secondary mb-6">What we check</p>
        <p className="text-[12px] leading-[18px] text-on-surface-secondary">
          We verify your right to work and reside in the UK via the Home Office Employer Checking Service. Your name and date of birth are returned — no address data is included.
        </p>
      </div>
    </KYCShell>
  );
}
