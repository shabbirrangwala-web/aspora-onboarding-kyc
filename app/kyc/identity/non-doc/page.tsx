"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { KYCShell } from "@/components/kyc/KYCShell";
import { useKYC, MOCK_DATA } from "@/lib/kyc-store";
import { CircularLoader } from "@/components/ui/circular-loader";
import { StandardButton } from "@/components/ui/button";

type Stage = "checking" | "pass" | "fail";

const CHECKS = ["Name & date of birth", "Address database", "Government records"];

export default function KYCNonDoc() {
  const router = useRouter();
  const { update } = useKYC();
  const [stage, setStage] = useState<Stage>("checking");
  const [currentCheck, setCurrentCheck] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    CHECKS.forEach((_, i) => {
      timers.push(setTimeout(() => setCurrentCheck(i + 1), (i + 1) * 800));
    });
    timers.push(
      setTimeout(() => {
        // ~85% pass in demo; deterministic for demo purposes
        update({ identityData: MOCK_DATA["non_doc"] });
        setStage("pass");
      }, CHECKS.length * 800 + 600)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  if (stage === "checking") {
    return (
      <KYCShell title="Identity check" step={3}>
        <div className="flex flex-col items-center pt-32 text-center">
          <CircularLoader size="xlarge" type="ring" />
          <h2 className="mt-24 type-headerSm text-on-surface-primary">Checking your identity...</h2>
          <p className="mt-8 type-bodySm text-on-surface-secondary">
            Verifying your details automatically via Persona. This takes a few seconds.
          </p>
        </div>

        <div className="mt-32 flex flex-col gap-8">
          {CHECKS.map((check, i) => {
            const done = currentCheck > i;
            const active = currentCheck === i;
            return (
              <div key={check} className="flex items-center gap-12 rounded-12 bg-surface-secondary p-12">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center">
                  {done ? (
                    <CheckCircle2 className="h-20 w-20 text-success-on-light" />
                  ) : active ? (
                    <CircularLoader size="small" type="ring" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-border-primary" />
                  )}
                </div>
                <span className={`text-[13px] font-medium ${done ? "text-on-surface-primary" : "text-on-surface-tertiary"}`}>
                  {check}
                </span>
              </div>
            );
          })}
        </div>
      </KYCShell>
    );
  }

  if (stage === "pass") {
    return (
      <KYCShell
        title="Identity check"
        step={3}
        cta="Review your details"
        onCta={() => router.push("/kyc/identity/confirm")}
      >
        <div className="flex flex-col items-center py-48 text-center">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <div className="flex h-80 w-80 items-center justify-center rounded-full bg-success-light">
              <CheckCircle2 className="h-40 w-40 text-success-on-light" />
            </div>
          </motion.div>
          <h2 className="mt-24 type-headerSm text-on-surface-primary">Identity confirmed</h2>
          <p className="mt-8 type-bodySm text-on-surface-secondary">
            We found a match. Please review and confirm the details we found.
          </p>
        </div>
      </KYCShell>
    );
  }

  // Fail — offer documentary fallback
  return (
    <KYCShell title="Identity check" step={3}>
      <div className="flex flex-col items-center py-32 text-center">
        <div className="flex h-80 w-80 items-center justify-center rounded-full bg-error-light">
          <XCircle className="h-40 w-40 text-error-on-light" />
        </div>
        <h2 className="mt-24 type-headerSm text-on-surface-primary">Check unsuccessful</h2>
        <p className="mt-8 type-bodySm text-on-surface-secondary">
          We couldn&apos;t verify your identity automatically. Please upload a document instead.
        </p>
      </div>

      <div className="mt-32 flex flex-col gap-12">
        <StandardButton
          onClick={() => {
            update({ idMethod: "brp" });
            router.push("/kyc/identity/document");
          }}
        >
          Upload BRP
        </StandardButton>
        <StandardButton
          hierarchy="secondary"
          onClick={() => {
            update({ idMethod: "driving_licence" });
            router.push("/kyc/identity/document");
          }}
        >
          Upload driving licence
        </StandardButton>
        <StandardButton
          hierarchy="secondary"
          onClick={() => {
            update({ idMethod: "passport", poaRequired: true });
            router.push("/kyc/identity/document");
          }}
        >
          Upload passport
        </StandardButton>
      </div>
    </KYCShell>
  );
}
