"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, User, MapPin, Briefcase, Search, FileText } from "lucide-react";
import { StandardButton } from "@/components/ui/button";
import { useKYC } from "@/lib/kyc-store";

const STEPS = [
  { icon: User, label: "Identity verification" },
  { icon: MapPin, label: "Address confirmation" },
  { icon: Briefcase, label: "Financial profile" },
  { icon: Search, label: "Risk & compliance check" },
  { icon: FileText, label: "Legal agreements" },
];

export default function KYCWelcome() {
  const router = useRouter();
  const { state, reset, update } = useKYC();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-surface-primary">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-1 flex-col px-16 pt-64"
      >
        <div className="mb-32 flex justify-center">
          <div className="flex h-80 w-80 items-center justify-center rounded-full bg-interactive-primary">
            <Shield className="h-40 w-40 text-interactive-contrast" />
          </div>
        </div>

        <span className="type-overline text-on-surface-tertiary">KYC Verification</span>
        <h1 className="mt-8 type-headerMd text-on-surface-primary">Verify your identity</h1>
        <p className="mt-8 type-bodySm text-on-surface-secondary">
          Before you start investing in US equities, we need to verify who you are. This takes about 5–7 minutes.
        </p>

        <div className="my-24 h-px bg-border-primary" />

        <p className="type-labelHeavySm text-on-surface-tertiary mb-16">What we&apos;ll cover</p>
        <div className="flex flex-col gap-16">
          {STEPS.map(({ icon: Icon, label }, i) => (
            <div key={i} className="flex items-center gap-12">
              <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-8 bg-surface-secondary">
                <Icon className="h-16 w-16 text-on-surface-secondary" />
              </div>
              <span className="type-labelMd text-on-surface-primary">{label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="px-16 pb-8 pt-12">
        <StandardButton
          onClick={() => {
            const scenario = state.scenario;
            reset();
            update({ scenario });
            router.push("/kyc/country");
          }}
        >
          Get started
        </StandardButton>
      </div>
    </main>
  );
}
