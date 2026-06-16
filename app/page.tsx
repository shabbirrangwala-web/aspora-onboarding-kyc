"use client";

import { useRouter } from "next/navigation";
import { useKYC } from "@/lib/kyc-store";
import type { KYCScenario } from "@/lib/kyc-store";

const SCENARIOS: {
  key: KYCScenario;
  label: string;
  customer: string;
  account: string;
  status: string;
  badgeClass: string;
  dotClass: string;
  desc: string;
}[] = [
  {
    key: "happy",
    label: "Scenario 1 — Happy Flow",
    customer: "Khalid Saeed Al-Mansoori",
    account: "280862283",
    status: "All Clear",
    badgeClass: "bg-green-100 text-green-800 border-green-300",
    dotClass: "bg-green-500",
    desc: "All KYC checks pass. Document, identity, photo, and watchlist results are all clear. Account auto-approved.",
  },
  {
    key: "watchlist",
    label: "Scenario 2 — Watchlist Consider",
    customer: "Priya Arjun Nair",
    account: "282976320",
    status: "Watchlist Consider",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
    dotClass: "bg-amber-500",
    desc: "Watchlist check returns consider — adverse media, PEP, and monitored lists flagged. Enhanced Due Diligence required.",
  },
  {
    key: "identity",
    label: "Scenario 3 — Identity Consider",
    customer: "Mohammed Jamal Al-Rashidi",
    account: "282306517",
    status: "Identity Consider",
    badgeClass: "bg-red-100 text-red-800 border-red-300",
    dotClass: "bg-red-500",
    desc: "Document and photo quality trigger consider — face match score 75, visual authenticity score 40. Manual review required.",
  },
];

export default function Home() {
  const router = useRouter();
  const { reset, update } = useKYC();

  function startScenario(key: KYCScenario) {
    reset();
    update({ scenario: key });
    router.push("/kyc");
  }

  return (
    <main className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">Aspora</span>
            <span className="text-gray-400 mx-2">×</span>
            <span className="text-gray-600 text-sm">Alpaca Broker API</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">KYC Scenario Flows</h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Select a scenario to walk through the full onboarding + KYC flow, then view the CIP API payload report.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {SCENARIOS.map((s) => (
            <button
              key={s.key}
              onClick={() => startScenario(s.key)}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-left hover:shadow-md transition-shadow active:scale-[0.99] w-full"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${s.dotClass}`} />
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{s.label}</span>
                  </div>
                  <span className={`shrink-0 text-xs font-bold px-2 py-1 rounded-full border ${s.badgeClass}`}>
                    {s.status}
                  </span>
                </div>
                <p className="font-bold text-gray-900">{s.customer}</p>
                <p className="text-xs text-gray-400 mb-2">Account #{s.account}</p>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">Start onboarding flow →</span>
                <span className="text-xs text-gray-400">KYC + CIP report</span>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-10">
          Aspora · Alpaca Broker API Sandbox · CIP Scenario Reference
        </p>
      </div>
    </main>
  );
}
