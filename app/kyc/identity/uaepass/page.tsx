"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Smartphone, CheckCircle2 } from "lucide-react";
import { KYCShell } from "@/components/kyc/KYCShell";
import { useKYC, MOCK_DATA } from "@/lib/kyc-store";
import { CircularLoader } from "@/components/ui/circular-loader";

type Stage = "prompt" | "redirecting" | "fetching" | "done";

const FETCHED_FIELDS = [
  "Full legal name",
  "Date of birth",
  "Nationality",
  "Emirates ID number",
  "Residential address",
];

export default function KYCUAEPass() {
  const router = useRouter();
  const { update } = useKYC();
  const [stage, setStage] = useState<Stage>("prompt");

  function handleLaunch() {
    setStage("redirecting");
    setTimeout(() => setStage("fetching"), 1800);
    setTimeout(() => {
      update({ identityData: MOCK_DATA["uaepass"] });
      setStage("done");
    }, 4000);
  }

  if (stage === "prompt") {
    return (
      <KYCShell title="UAEPass" step={3} cta="Open UAEPass" onCta={handleLaunch}>
        <div className="flex flex-col items-center py-24 text-center">
          <div className="mb-24 flex h-80 w-80 items-center justify-center rounded-full bg-accent-light">
            <Smartphone className="h-40 w-40 text-accent-on-light" />
          </div>
          <h2 className="type-headerSm text-on-surface-primary">Verify with UAEPass</h2>
          <p className="mt-12 type-bodySm text-on-surface-secondary">
            You&apos;ll be redirected to the UAEPass platform to authenticate. Your details are fetched directly from the ICP — no manual entry.
          </p>
        </div>

        <div className="rounded-12 bg-surface-secondary p-16">
          <p className="mb-12 text-[12px] font-semibold text-on-surface-secondary">What we&apos;ll fetch</p>
          <div className="flex flex-col gap-10">
            {FETCHED_FIELDS.map((f) => (
              <div key={f} className="flex items-center gap-10">
                <CheckCircle2 className="h-16 w-16 shrink-0 text-success-on-light" />
                <span className="text-[13px] text-on-surface-primary">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </KYCShell>
    );
  }

  return (
    <KYCShell
      title="UAEPass"
      step={3}
      cta="Continue"
      ctaDisabled={stage !== "done"}
      onCta={() => router.push("/kyc/identity/confirm")}
    >
      <div className="flex flex-col items-center py-48 text-center">
        {stage === "done" ? (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <div className="flex h-80 w-80 items-center justify-center rounded-full bg-success-light">
              <CheckCircle2 className="h-40 w-40 text-success-on-light" />
            </div>
          </motion.div>
        ) : (
          <CircularLoader size="xlarge" type="ring" />
        )}

        <h2 className="mt-24 type-headerSm text-on-surface-primary">
          {stage === "redirecting" && "Redirecting to UAEPass..."}
          {stage === "fetching" && "Fetching your details..."}
          {stage === "done" && "Identity verified"}
        </h2>
        <p className="mt-8 type-bodySm text-on-surface-secondary">
          {stage === "redirecting" && "Opening UAEPass. Please authenticate with your PIN or biometrics."}
          {stage === "fetching" && "Reading your Emirates ID data from the ICP database."}
          {stage === "done" && "Your details have been fetched successfully."}
        </p>
      </div>
    </KYCShell>
  );
}
