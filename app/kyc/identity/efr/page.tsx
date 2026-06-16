"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Fingerprint, CheckCircle2 } from "lucide-react";
import { KYCShell } from "@/components/kyc/KYCShell";
import { useKYC, MOCK_DATA } from "@/lib/kyc-store";
import { CircularLoader } from "@/components/ui/circular-loader";

type Stage = "prompt" | "scanning" | "done";

export default function KYCEfr() {
  const router = useRouter();
  const { update } = useKYC();
  const [stage, setStage] = useState<Stage>("prompt");

  function handleLaunch() {
    setStage("scanning");
    setTimeout(() => {
      update({ identityData: MOCK_DATA["efr"] });
      setStage("done");
    }, 3200);
  }

  return (
    <KYCShell
      title="Emirates Face Recognition"
      step={3}
      cta={stage === "done" ? "Continue" : stage === "prompt" ? "Launch EFR" : undefined}
      onCta={
        stage === "done"
          ? () => router.push("/kyc/identity/confirm")
          : stage === "prompt"
            ? handleLaunch
            : undefined
      }
    >
      <div className="flex flex-col items-center py-24 text-center">
        {stage === "prompt" && (
          <>
            <div className="mb-24 flex h-80 w-80 items-center justify-center rounded-full bg-accent-light">
              <Fingerprint className="h-40 w-40 text-accent-on-light" />
            </div>
            <h2 className="type-headerSm text-on-surface-primary">Verify with EFR</h2>
            <p className="mt-12 type-bodySm text-on-surface-secondary">
              The Emirates Face Recognition (EFR) platform verifies your identity biometrically against the ICP database. Your details are fetched automatically.
            </p>
            <div className="mt-24 w-full rounded-12 bg-surface-secondary p-16 text-left">
              <p className="text-[12px] font-semibold text-on-surface-secondary">How it works</p>
              <div className="mt-10 flex flex-col gap-10">
                {[
                  "You're redirected to the EFR platform",
                  "Your face is scanned and matched to ICP records",
                  "Details returned automatically — no uploads needed",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-10">
                    <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-surface-tertiary text-[10px] font-bold text-on-surface-tertiary">
                      {i + 1}
                    </span>
                    <span className="text-[13px] leading-[18px] text-on-surface-primary">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {stage === "scanning" && (
          <>
            <CircularLoader size="xlarge" type="ring" />
            <h2 className="mt-24 type-headerSm text-on-surface-primary">Connecting to EFR...</h2>
            <p className="mt-8 type-bodySm text-on-surface-secondary">
              Please follow the on-screen prompts on the EFR platform.
            </p>
          </>
        )}

        {stage === "done" && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="flex flex-col items-center"
          >
            <div className="flex h-80 w-80 items-center justify-center rounded-full bg-success-light">
              <CheckCircle2 className="h-40 w-40 text-success-on-light" />
            </div>
            <h2 className="mt-24 type-headerSm text-on-surface-primary">Identity verified</h2>
            <p className="mt-8 type-bodySm text-on-surface-secondary">
              Your details have been fetched from the ICP database via EFR.
            </p>
          </motion.div>
        )}
      </div>
    </KYCShell>
  );
}
