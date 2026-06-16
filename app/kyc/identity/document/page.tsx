"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, CheckCircle2 } from "lucide-react";
import { KYCShell } from "@/components/kyc/KYCShell";
import { useKYC, MOCK_DATA } from "@/lib/kyc-store";
import { CircularLoader } from "@/components/ui/circular-loader";
import { cn } from "@/lib/utils";

interface DocConfig {
  title: string;
  instructions: string[];
  sides: Array<"front" | "back">;
}

const DOC_CONFIG: Record<string, DocConfig> = {
  emirates_id: {
    title: "Emirates ID",
    instructions: [
      "Place on a flat, well-lit surface",
      "Ensure all four corners are visible",
      "Front and back required",
    ],
    sides: ["front", "back"],
  },
  passport: {
    title: "Passport",
    instructions: [
      "Open to the photo / data page",
      "Ensure the MRZ (two lines at bottom) is clearly visible",
      "No flash — avoid glare on the laminate",
    ],
    sides: ["front"],
  },
  brp: {
    title: "Biometric Residence Permit",
    instructions: [
      "Place on a flat, well-lit surface",
      "All four corners visible",
      "Front and back required",
    ],
    sides: ["front", "back"],
  },
  driving_licence: {
    title: "UK Driving Licence",
    instructions: [
      "Photocard side clearly visible",
      "All four corners visible",
      "Front and back required",
    ],
    sides: ["front", "back"],
  },
};

type Stage = "upload" | "processing" | "done";

export default function KYCDocument() {
  const router = useRouter();
  const { state, update } = useKYC();
  const [stage, setStage] = useState<Stage>("upload");
  const [uploadedFront, setUploadedFront] = useState(false);
  const [uploadedBack, setUploadedBack] = useState(false);

  const method = state.idMethod ?? "passport";
  const config = DOC_CONFIG[method] ?? DOC_CONFIG.passport;
  const needsBack = config.sides.includes("back");
  const canSubmit = uploadedFront && (!needsBack || uploadedBack);

  function handleProcess() {
    setStage("processing");
    setTimeout(() => {
      update({ identityData: MOCK_DATA[method] ?? MOCK_DATA.passport });
      setStage("done");
    }, 2800);
  }

  if (stage === "processing") {
    return (
      <KYCShell title={config.title} step={3}>
        <div className="flex flex-col items-center py-48 text-center">
          <CircularLoader size="xlarge" type="ring" />
          <h2 className="mt-24 type-headerSm text-on-surface-primary">Scanning document...</h2>
          <p className="mt-8 type-bodySm text-on-surface-secondary">
            Extracting your details. This takes a few seconds.
          </p>
        </div>
      </KYCShell>
    );
  }

  if (stage === "done") {
    return (
      <KYCShell
        title={config.title}
        step={3}
        cta="Continue to selfie"
        onCta={() => router.push("/kyc/selfie")}
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
          <h2 className="mt-24 type-headerSm text-on-surface-primary">Document scanned</h2>
          <p className="mt-8 type-bodySm text-on-surface-secondary">
            Details extracted successfully. Next, take a quick selfie to confirm it&apos;s you.
          </p>
        </div>
      </KYCShell>
    );
  }

  return (
    <KYCShell
      title={config.title}
      step={3}
      cta="Scan document"
      ctaDisabled={!canSubmit}
      onCta={handleProcess}
    >
      <h2 className="type-headerSm text-on-surface-primary">Upload your {config.title}</h2>

      <div className="mt-12 flex flex-col gap-8">
        {config.instructions.map((inst, i) => (
          <div key={i} className="flex items-start gap-8">
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-[10px] font-bold text-on-surface-tertiary">
              {i + 1}
            </span>
            <span className="text-[13px] leading-[18px] text-on-surface-secondary">{inst}</span>
          </div>
        ))}
      </div>

      <div className="mt-24 flex flex-col gap-12">
        {/* Front */}
        <button
          type="button"
          onClick={() => setUploadedFront(true)}
          className={cn(
            "flex h-[140px] w-full flex-col items-center justify-center gap-8 rounded-16 border-[1.5px] border-dashed transition-all",
            uploadedFront
              ? "border-success-border bg-success-light"
              : "border-border-primary hover:border-on-surface-primary hover:bg-overlay-light-hover active:bg-overlay-light-pressed"
          )}
        >
          {uploadedFront ? (
            <>
              <CheckCircle2 className="h-24 w-24 text-success-on-light" />
              <span className="text-[13px] font-semibold text-success-on-light">Front uploaded ✓</span>
            </>
          ) : (
            <>
              <Camera className="h-24 w-24 text-on-surface-tertiary" />
              <span className="text-[13px] font-medium text-on-surface-secondary">
                Tap to capture — front{needsBack ? "" : " (only side needed)"}
              </span>
            </>
          )}
        </button>

        {/* Back */}
        {needsBack && (
          <button
            type="button"
            onClick={() => uploadedFront && setUploadedBack(true)}
            disabled={!uploadedFront}
            className={cn(
              "flex h-[140px] w-full flex-col items-center justify-center gap-8 rounded-16 border-[1.5px] border-dashed transition-all",
              uploadedBack
                ? "border-success-border bg-success-light"
                : uploadedFront
                  ? "border-border-primary hover:border-on-surface-primary hover:bg-overlay-light-hover"
                  : "border-border-disabled opacity-40"
            )}
          >
            {uploadedBack ? (
              <>
                <CheckCircle2 className="h-24 w-24 text-success-on-light" />
                <span className="text-[13px] font-semibold text-success-on-light">Back uploaded ✓</span>
              </>
            ) : (
              <>
                <Camera className="h-24 w-24 text-on-surface-tertiary" />
                <span className="text-[13px] font-medium text-on-surface-secondary">
                  {uploadedFront ? "Tap to capture — back" : "Complete front first"}
                </span>
              </>
            )}
          </button>
        )}
      </div>
    </KYCShell>
  );
}
