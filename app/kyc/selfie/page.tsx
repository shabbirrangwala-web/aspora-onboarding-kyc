"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, CheckCircle2, RotateCcw, Clock } from "lucide-react";
import { KYCShell } from "@/components/kyc/KYCShell";
import { useKYC } from "@/lib/kyc-store";
import { CircularLoader } from "@/components/ui/circular-loader";

type Stage = "prompt" | "capturing" | "processing" | "pass" | "fail";

const TIPS = [
  "Face the camera directly",
  "Good lighting — avoid shadows",
  "Remove glasses or hat",
  "Neutral expression",
];

export default function KYCSelfie() {
  const router = useRouter();
  const { state, update } = useKYC();
  const [stage, setStage] = useState<Stage>("prompt");
  const [attempts, setAttempts] = useState(0);

  function handleCapture() {
    setStage("capturing");
    setTimeout(() => setStage("processing"), 1600);
    setTimeout(() => {
      // Always pass in demo — score 82
      const score = 82;
      update({ selfieScore: score });
      setStage("pass");
    }, 3800);
  }

  function handleRetake() {
    setAttempts((a) => a + 1);
    setStage("prompt");
  }

  const attemptsLeft = 3 - attempts;

  if (stage === "prompt") {
    return (
      <KYCShell title="Selfie" step={4} cta="Take selfie" onCta={handleCapture}>
        <h2 className="type-headerSm text-on-surface-primary">Let&apos;s confirm it&apos;s you</h2>
        <p className="mt-8 type-bodySm text-on-surface-secondary">
          A live selfie will be compared against your identity document. A score of 75+ confirms a match.
        </p>

        {attempts > 0 && (
          <div className="mt-12 flex items-center gap-8 rounded-12 bg-warning-light p-12">
            <Clock className="h-16 w-16 shrink-0 text-warning-on-light" />
            <span className="text-[13px] text-warning-on-light">
              {attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} remaining before manual review
            </span>
          </div>
        )}

        <div className="mt-20 flex h-[200px] w-full items-center justify-center rounded-24 bg-surface-secondary">
          <div className="flex flex-col items-center gap-12 text-on-surface-tertiary">
            <Camera className="h-48 w-48" />
            <span className="text-[13px]">Camera opens here</span>
          </div>
        </div>

        <div className="mt-20 rounded-12 bg-surface-secondary p-16">
          <p className="mb-10 text-[12px] font-semibold text-on-surface-secondary">Tips for a good selfie</p>
          {TIPS.map((tip) => (
            <p key={tip} className="py-2 text-[12px] text-on-surface-tertiary">• {tip}</p>
          ))}
        </div>
      </KYCShell>
    );
  }

  if (stage === "capturing" || stage === "processing") {
    return (
      <KYCShell title="Selfie" step={4}>
        <div className="flex flex-col items-center py-48 text-center">
          <CircularLoader size="xlarge" type={stage === "capturing" ? "fill" : "ring"} />
          <h2 className="mt-24 type-headerSm text-on-surface-primary">
            {stage === "capturing" ? "Hold still..." : "Checking match..."}
          </h2>
          <p className="mt-8 type-bodySm text-on-surface-secondary">
            {stage === "capturing"
              ? "Capturing your selfie. Keep your face centred."
              : "Comparing against your document photo."}
          </p>
        </div>
      </KYCShell>
    );
  }

  if (stage === "pass") {
    return (
      <KYCShell
        title="Selfie"
        step={4}
        cta="Continue"
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
          <h2 className="mt-24 type-headerSm text-on-surface-primary">Face matched</h2>
          <p className="mt-8 type-bodySm text-on-surface-secondary">
            Match score: <span className="font-semibold text-on-surface-primary">{state.selfieScore}/100</span>. Liveness confirmed.
          </p>
        </div>
      </KYCShell>
    );
  }

  // Fail state
  if (attemptsLeft <= 0) {
    return (
      <KYCShell title="Selfie" step={4}>
        <div className="flex flex-col items-center py-48 text-center">
          <div className="flex h-80 w-80 items-center justify-center rounded-full bg-warning-light">
            <Clock className="h-40 w-40 text-warning-on-light" />
          </div>
          <h2 className="mt-24 type-headerSm text-on-surface-primary">Manual review triggered</h2>
          <p className="mt-8 type-bodySm text-on-surface-secondary">
            Too many failed attempts. Our operations team will review your application within 1 business day.
          </p>
        </div>
      </KYCShell>
    );
  }

  return (
    <KYCShell title="Selfie" step={4} cta="Try again" onCta={handleRetake}>
      <div className="flex flex-col items-center py-48 text-center">
        <div className="flex h-80 w-80 items-center justify-center rounded-full bg-error-light">
          <RotateCcw className="h-40 w-40 text-error-on-light" />
        </div>
        <h2 className="mt-24 type-headerSm text-on-surface-primary">No match found</h2>
        <p className="mt-8 type-bodySm text-on-surface-secondary">
          The face didn&apos;t match your document. Please try again.
          {attemptsLeft < 3 && (
            <> {attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} left.</>
          )}
        </p>
      </div>
    </KYCShell>
  );
}
