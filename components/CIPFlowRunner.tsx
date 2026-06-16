"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import { TopBar, BottomBar, NextBtn } from "./CIPShell";

export interface FlowStep {
  title: string;
  screen: (ctx: FlowCtx) => ReactNode;
  nextLabel?: string;
  canAdvance?: (ctx: FlowCtx) => boolean;
}

export interface FlowCtx {
  verifyMethod: string;
  setVerifyMethod: (m: string) => void;
}

export function FlowRunner({
  steps,
  scenarioLabel,
  scenarioHref,
  reportHref,
}: {
  steps: FlowStep[];
  scenarioLabel: string;
  scenarioHref: string;
  reportHref?: string;
}) {
  const [index, setIndex] = useState(0);
  const [verifyMethod, setVerifyMethod] = useState("uaepass");

  const ctx: FlowCtx = { verifyMethod, setVerifyMethod };
  const step = steps[index];
  const isLast = index === steps.length - 1;
  const progress = (index + 1) / steps.length;
  const canAdvance = step.canAdvance ? step.canAdvance(ctx) : true;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex justify-center">
        <div className="relative w-full max-w-[430px] bg-white min-h-screen shadow-xl">
          {/* Scenario ribbon */}
          <div className="bg-gray-900 text-white text-xs font-bold text-center py-1.5 tracking-wide no-print">
            {scenarioLabel}
          </div>

          <TopBar
            title={step.title}
            progress={progress}
            onBack={index > 0 ? () => setIndex((i) => i - 1) : undefined}
            step={index + 1}
            total={steps.length}
          />

          <div className="pb-40">{step.screen(ctx)}</div>

          <BottomBar>
            {isLast ? (
              <div className="flex flex-col gap-2">
                {reportHref && (
                  <Link
                    href={reportHref}
                    className="w-full bg-black text-white font-bold rounded-full py-4 text-sm tracking-wide text-center block"
                  >
                    View CIP report →
                  </Link>
                )}
                <Link
                  href="/"
                  className="w-full bg-gray-100 text-gray-700 font-bold rounded-full py-4 text-sm tracking-wide text-center block"
                >
                  Back to scenarios
                </Link>
              </div>
            ) : (
              <NextBtn
                label={step.nextLabel ?? "Continue"}
                onClick={() => canAdvance && setIndex((i) => i + 1)}
                disabled={!canAdvance}
              />
            )}
          </BottomBar>
        </div>
      </div>
    </div>
  );
}
