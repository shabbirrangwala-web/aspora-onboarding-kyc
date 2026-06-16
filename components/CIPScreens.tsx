"use client";

import { CheckCircle, AlertCircle, ShieldCheck, Smartphone, FileText, Camera, CreditCard, FileCheck, Clock, Upload, Scan } from "lucide-react";
import { Body, PageTitle, DataRow, InfoBox, Badge } from "./CIPShell";
import { FlowCtx } from "./CIPFlowRunner";

/* ─── 1. Welcome ─── */
export function WelcomeScreen({ name }: { name: string }) {
  return (
    <Body>
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mb-6">
          <ShieldCheck size={36} className="text-white" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Aspora × Alpaca</p>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3 leading-tight">
          Open your global<br />investment account
        </h1>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed max-w-xs">
          Invest in US stocks and ETFs from the UAE. Powered by Alpaca Securities, regulated by FINRA & SIPC.
        </p>
        <div className="w-full space-y-3 text-left">
          {[
            { icon: "🛡️", text: "Identity verified in minutes" },
            { icon: "📋", text: "Compliant KYC & AML screening" },
            { icon: "📈", text: "Access to 10,000+ US securities" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium text-gray-700">{item.text}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-6">Getting started for: <strong className="text-gray-600">{name}</strong></p>
      </div>
    </Body>
  );
}

/* ─── 2. Country ─── */
export function CountryScreen() {
  return (
    <Body>
      <PageTitle label="Step 1 of 5" title="Where do you live?" subtitle="We tailor your account opening to your country of residence." />
      <div className="space-y-3 mb-5">
        <div className="border-2 border-black bg-black/5 rounded-2xl px-5 py-4 flex items-center gap-4">
          <span className="text-3xl">🇦🇪</span>
          <div className="flex-1">
            <p className="font-bold text-gray-900">United Arab Emirates</p>
            <p className="text-xs text-gray-500">Dubai · Abu Dhabi · Sharjah</p>
          </div>
          <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        </div>
        <div className="border border-gray-200 rounded-2xl px-5 py-4 flex items-center gap-4 opacity-40">
          <span className="text-3xl">🇬🇧</span>
          <div className="flex-1">
            <p className="font-medium text-gray-700">United Kingdom</p>
            <p className="text-xs text-gray-400">England · Scotland · Wales · N. Ireland</p>
          </div>
        </div>
      </div>
      <InfoBox>
        🇦🇪 <strong>UAE residents</strong> can verify their identity instantly using <strong>UAE PASS</strong> — the government digital identity platform — or by uploading a physical document.
      </InfoBox>
    </Body>
  );
}

/* ─── 3. Verify method (fully interactive) ─── */
const METHODS = [
  {
    id: "uaepass",
    icon: Smartphone,
    label: "UAE PASS",
    sub: "Instant government-verified identity via UAE PASS app",
    tag: "Recommended · Instant",
    tagColor: "text-green-700",
  },
  {
    id: "efr",
    icon: Scan,
    label: "Emirates Face Recognition (EFR)",
    sub: "Biometric face scan linked to your Emirates ID",
    tag: "Fast · Secure",
    tagColor: "text-blue-700",
  },
  {
    id: "emirates_id",
    icon: CreditCard,
    label: "Emirates ID",
    sub: "Upload front & back of your physical Emirates ID card",
    tag: "Manual upload",
    tagColor: "text-gray-600",
  },
  {
    id: "passport",
    icon: FileText,
    label: "Passport",
    sub: "Upload the photo page of your passport + a selfie",
    tag: "Manual upload",
    tagColor: "text-gray-600",
  },
] as const;

export function VerifyMethodScreen({ ctx }: { ctx: FlowCtx }) {
  const selected = ctx.verifyMethod;
  return (
    <Body>
      <PageTitle label="Step 2 of 5" title="How would you like to verify?" subtitle="Choose your preferred identity verification method." />
      <div className="space-y-3 mb-5">
        {METHODS.map((m) => {
          const isSelected = selected === m.id;
          return (
            <button
              key={m.id}
              onClick={() => ctx.setVerifyMethod(m.id)}
              className={`w-full text-left border-2 rounded-2xl px-5 py-4 transition-all active:scale-[0.98] ${
                isSelected ? "border-black bg-black/5" : "border-gray-200 bg-white hover:border-gray-400"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isSelected ? "bg-black" : "bg-gray-100"}`}>
                  <m.icon size={16} className={isSelected ? "text-white" : "text-gray-500"} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-gray-900 text-sm">{m.label}</p>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center shrink-0">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                  <p className={`text-xs font-semibold ${m.tagColor} mb-0.5`}>{m.tag}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{m.sub}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <InfoBox>
        🔐 Your identity data is fetched or scanned securely. Aspora never stores raw document images permanently.
      </InfoBox>
    </Body>
  );
}

/* ─── 4a. UAE PASS Auth ─── */
export function UAEPassScreen() {
  return (
    <Body>
      <PageTitle label="Step 2 of 5" title="Connecting to UAE PASS" subtitle="Authenticate with your UAE PASS app to share your identity details securely." />
      <div className="flex flex-col items-center py-6">
        <div className="w-44 h-44 rounded-3xl border-2 border-gray-900 flex flex-col items-center justify-center mb-6 bg-white shadow-lg p-4">
          <div className="grid grid-cols-7 gap-0.5 mb-2">
            {Array.from({ length: 49 }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-[2px] ${
                  [0,1,2,3,4,5,6,7,13,14,20,21,27,28,34,35,41,42,43,44,45,46,47,48,
                    10,11,12,17,22,24,31,36,38].includes(i)
                    ? "bg-gray-900"
                    : "bg-white"
                }`}
              />
            ))}
          </div>
          <p className="text-[9px] text-gray-400">Scan in UAE PASS app</p>
        </div>
        <p className="text-sm text-gray-500 text-center mb-5 max-w-xs">
          Open the <strong>UAE PASS</strong> app on your phone and scan the QR code, or authenticate via OTP.
        </p>
        <div className="w-full border border-dashed border-gray-300 rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-400 mb-3">— or authenticate via SMS OTP —</p>
          <div className="flex gap-2 justify-center">
            {["7","2","4","9","1","8"].map((d, i) => (
              <div key={i} className="w-9 h-11 border-2 border-gray-300 rounded-lg flex items-center justify-center font-bold text-gray-800 text-lg bg-white">
                {d}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <ShieldCheck size={14} />
        <span>Secured by UAE PASS · TRA certified · ISO 27001</span>
      </div>
    </Body>
  );
}

/* ─── 4b. EFR Screen ─── */
export function EFRScreen() {
  return (
    <Body>
      <PageTitle label="Step 2 of 5" title="Face recognition scan" subtitle="Look directly at your camera. The scan takes about 5 seconds." />
      <div className="flex flex-col items-center py-4">
        <div className="relative w-56 h-56 mb-6">
          {/* Oval face outline */}
          <div className="absolute inset-0 rounded-full border-4 border-dashed border-black flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-2">
              <Camera size={36} className="text-gray-400" />
              <p className="text-xs text-gray-400 font-medium">Position your face here</p>
            </div>
          </div>
          {/* Corner markers */}
          {["-top-1 -left-1","−top-1 -right-1","-bottom-1 -left-1","-bottom-1 -right-1"].map((pos,i) => (
            <div key={i} className={`absolute w-6 h-6 border-4 border-black rounded-sm ${
              i===0 ? "top-0 left-0 border-r-0 border-b-0" :
              i===1 ? "top-0 right-0 border-l-0 border-b-0" :
              i===2 ? "bottom-0 left-0 border-r-0 border-t-0" :
                      "bottom-0 right-0 border-l-0 border-t-0"
            }`} />
          ))}
        </div>
        <div className="w-full space-y-3">
          {[
            { icon: CheckCircle, text: "Good lighting detected", done: true },
            { icon: CheckCircle, text: "Face centred in frame", done: true },
            { icon: CheckCircle, text: "Liveness check passed", done: true },
            { icon: CheckCircle, text: "Emirates ID matched", done: true },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
              <item.icon size={16} className="text-green-600 shrink-0" />
              <span className="text-sm font-medium text-green-800">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
      <InfoBox>
        🔒 Emirates Face Recognition (EFR) is managed by the UAE Ministry of Interior. Your biometric data is processed by the government and never stored by Aspora.
      </InfoBox>
    </Body>
  );
}

/* ─── 4c. Upload Document ─── */
export function UploadDocScreen({ ctx }: { ctx: FlowCtx }) {
  const isEmiratesId = ctx.verifyMethod === "emirates_id";
  const docLabel = isEmiratesId ? "Emirates ID" : "Passport";
  const docIcon = isEmiratesId ? CreditCard : FileText;
  const DocIcon = docIcon;

  return (
    <Body>
      <PageTitle
        label="Step 2 of 5"
        title={`Upload your ${docLabel}`}
        subtitle={`Take clear photos of your ${docLabel}${isEmiratesId ? " (front and back)" : " (photo page)"} and a selfie.`}
      />
      <div className="space-y-3 mb-5">
        {[
          {
            icon: DocIcon,
            label: `${docLabel} — front`,
            hint: isEmiratesId ? "Tap to photograph or upload" : "Photo page with your picture",
            done: true,
          },
          ...(isEmiratesId
            ? [{ icon: DocIcon, label: `${docLabel} — back`, hint: "Back side of your Emirates ID", done: true }]
            : []),
          {
            icon: Camera,
            label: "Selfie",
            hint: "Look straight at camera, no glasses",
            done: true,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 border-2 border-green-300 bg-green-50 rounded-2xl px-4 py-4"
          >
            <div className="w-10 h-10 bg-white border border-green-200 rounded-xl flex items-center justify-center shrink-0">
              <item.icon size={18} className="text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-500">{item.hint}</p>
            </div>
            <CheckCircle size={20} className="text-green-600 shrink-0" />
          </div>
        ))}
      </div>
      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-5 text-center mb-5">
        <Upload size={24} className="text-gray-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-gray-700">Tap to upload additional documents</p>
        <p className="text-xs text-gray-400">JPG, PNG or PDF · Max 10 MB per file</p>
      </div>
      <InfoBox>
        All uploads are encrypted end-to-end. Documents are processed by our KYC provider (Onfido / Jumio) and not stored beyond verification.
      </InfoBox>
    </Body>
  );
}

/* ─── 5. Identity Verified ─── */
export function VerifiedScreen({ ctx }: { ctx: FlowCtx }) {
  const methodLabel: Record<string, string> = {
    uaepass: "UAE PASS",
    efr: "Emirates Face Recognition (EFR)",
    emirates_id: "Emirates ID scan",
    passport: "Passport upload",
  };
  const method = methodLabel[ctx.verifyMethod] ?? "UAE PASS";
  return (
    <Body>
      <div className="flex flex-col items-center justify-center min-h-[65vh] text-center">
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <CheckCircle size={48} className="text-green-600" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-green-600 mb-2">Verified</p>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Identity confirmed</h1>
        <p className="text-sm text-gray-500 max-w-xs">
          Your identity has been verified via <strong>{method}</strong>. Your details have been securely fetched.
        </p>
        <div className="mt-8 w-full bg-green-50 border border-green-200 rounded-2xl p-4 text-left">
          {["Full name retrieved", "Date of birth confirmed", "Document number verified", "Address on record"].map((item) => (
            <div key={item} className="flex items-center gap-2 py-1.5">
              <CheckCircle size={15} className="text-green-600 shrink-0" />
              <span className="text-sm text-green-800 font-medium">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </Body>
  );
}

/* ─── 6. Review details ─── */
export function ReviewDetailsScreen({
  firstName, lastName, dob, nationality, documentNumber, address,
}: {
  firstName: string; lastName: string; dob: string; nationality: string; documentNumber: string; address: string;
}) {
  return (
    <Body>
      <PageTitle label="Step 3 of 5" title="Is everything correct?" subtitle="Fetched from your identity document. Edit anything that's incorrect." />
      <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100 mb-5">
        <DataRow label="First name" value={firstName} />
        <DataRow label="Last name" value={lastName} />
        <DataRow label="Date of birth" value={dob} />
        <DataRow label="Nationality" value={nationality} />
        <DataRow label="Document number" value={documentNumber} />
        <DataRow label="Residential address" value={address} />
      </div>
      <InfoBox>
        These details are pre-filled from your identity verification. Your document number is used as your tax identifier with Alpaca Securities.
      </InfoBox>
    </Body>
  );
}

/* ─── 7. Tax ─── */
export function TaxScreen({ taxId }: { taxId: string }) {
  return (
    <Body>
      <PageTitle label="Step 3 of 5" title="Tax identification" subtitle="Required for US securities reporting under FATCA." />
      <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100 mb-5">
        <DataRow label="Tax identifier type" value="UAE Emirates ID (OTHER)" />
        <DataRow label="Tax identifier" value={taxId} />
        <DataRow label="Country of tax residence" value="United Arab Emirates" />
        <DataRow label="Country of residency" value="United Arab Emirates" />
      </div>
      <InfoBox>
        <strong>Why is this required?</strong> As a non-US investor, the IRS requires your tax identifier to report dividend income and capital gains under FATCA. UAE does not issue personal tax IDs — your Emirates ID is used as the identifier.
      </InfoBox>
    </Body>
  );
}

/* ─── 8. Contact ─── */
export function ContactScreen({ email, phone }: { email: string; phone: string }) {
  return (
    <Body>
      <PageTitle label="Step 3 of 5" title="Contact details" subtitle="Required by Alpaca Securities to open and manage your account." />
      <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100 mb-5">
        <DataRow label="Email address" value={email} />
        <DataRow label="Phone number" value={phone} />
      </div>
      <InfoBox>
        Your email is used for account notifications and regulatory communications. Your phone number is required for two-factor authentication and account security.
      </InfoBox>
    </Body>
  );
}

/* ─── 9. Employment ─── */
export function EmploymentScreen({ employer, income }: { employer: string; income: string }) {
  return (
    <Body>
      <PageTitle label="Step 4 of 5" title="Employment & income" subtitle="Required for AML risk assessment and account suitability." />
      <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100 mb-5">
        <DataRow label="Employment status" value="Employed (full-time)" />
        <DataRow label="Employer" value={employer} />
        <DataRow label="Job title" value="Senior Manager" />
        <DataRow label="Annual income" value={income} />
        <DataRow label="Source of funds" value="Employment income" />
        <DataRow label="Intended initial deposit" value="USD 5,000 – 25,000" />
      </div>
      <InfoBox>
        This information is used to assess suitability of investment products and comply with UAE and US anti-money laundering regulations.
      </InfoBox>
    </Body>
  );
}

/* ─── 10. Trading ─── */
export function TradingScreen() {
  return (
    <Body>
      <PageTitle label="Step 4 of 5" title="Investment experience" subtitle="Helps us ensure products are suitable for your knowledge level." />
      <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100 mb-5">
        <DataRow label="Investment experience" value="3–5 years" />
        <DataRow label="Asset classes traded" value="Equities, ETFs" />
        <DataRow label="Risk tolerance" value="Moderate" />
        <DataRow label="Investment objective" value="Long-term growth" />
        <DataRow label="Annual trading frequency" value="10–25 trades per year" />
        <DataRow label="Leverage / margin use" value="No" />
      </div>
      <InfoBox>
        Investment experience is assessed to ensure regulatory suitability under SEC and FINRA requirements for non-US investors.
      </InfoBox>
    </Body>
  );
}

/* ─── 11. Disclosures ─── */
export function DisclosuresScreen() {
  return (
    <Body>
      <PageTitle label="Step 4 of 5" title="Regulatory disclosures" subtitle="Required by Alpaca Securities under FINRA and SEC regulations." />
      <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100 mb-5">
        {[
          { label: "Are you a control person of a publicly traded company?", value: "No" },
          { label: "Are you affiliated with or employed by FINRA or a stock exchange?", value: "No" },
          { label: "Are you a politically exposed person (PEP)?", value: "No" },
          { label: "Does an immediate family member hold a PEP position?", value: "No" },
        ].map((d) => (
          <div key={d.label} className="px-4 py-3 flex items-start justify-between gap-4">
            <span className="text-xs text-gray-600 leading-relaxed flex-1">{d.label}</span>
            <span className="text-xs font-bold text-gray-900 shrink-0">{d.value}</span>
          </div>
        ))}
      </div>
      <InfoBox>
        All disclosures are submitted to Alpaca Securities as part of your account application and are subject to regulatory review.
      </InfoBox>
    </Body>
  );
}

/* ─── 12. Background check ─── */
type CheckResult = "clear" | "consider";

export function BackgroundCheckScreen({
  checkResults,
  isIdentityScenario,
}: {
  checkResults: Record<string, CheckResult>;
  isIdentityScenario?: boolean;
}) {
  const checks = isIdentityScenario
    ? [
        { key: "doc_quality", label: "Document image quality", sub: "Resolution, clarity, and completeness" },
        { key: "face_match", label: "Facial biometric match", sub: "Comparing selfie to document photo" },
        { key: "doc_auth", label: "Document authenticity", sub: "Visual and digital tampering checks" },
        { key: "identity", label: "Identity verification", sub: "Name, DOB, address cross-check" },
      ]
    : [
        { key: "ofac", label: "OFAC sanctions screening", sub: "US Treasury Office of Foreign Assets Control" },
        { key: "pep", label: "Politically exposed persons", sub: "PEP screening across global databases" },
        { key: "aml", label: "AML watchlists", sub: "Anti-money laundering global watchlists" },
        { key: "adverse", label: "Adverse media", sub: "Financial crime & regulatory news" },
      ];

  const hasConsider = Object.values(checkResults).some((v) => v === "consider");

  return (
    <Body>
      <PageTitle
        label="Step 5 of 5"
        title={hasConsider ? "Review required" : "Background check complete"}
        subtitle={
          hasConsider
            ? "One or more checks require further review by our compliance team."
            : "All automated checks passed. No issues detected."
        }
      />
      <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100 mb-5">
        {checks.map((c) => {
          const result = checkResults[c.key] || "clear";
          return (
            <div key={c.key} className="flex items-center gap-3 px-4 py-4">
              <div className="shrink-0">
                {result === "clear" ? (
                  <CheckCircle size={22} className="text-green-600" />
                ) : (
                  <AlertCircle size={22} className="text-amber-500" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{c.label}</p>
                <p className="text-xs text-gray-500">{c.sub}</p>
              </div>
              <Badge result={result} />
            </div>
          );
        })}
      </div>
      {hasConsider ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800">
          <strong>Action required:</strong> Our compliance team will contact you within 1–2 business days to complete the review.
        </div>
      ) : (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-sm text-green-800">
          <strong>All clear!</strong> Your background check passed. Proceeding to agreements.
        </div>
      )}
    </Body>
  );
}

/* ─── 13a. Agreements ─── */
export function AgreementsScreen({ name, dob, taxId, address }: { name: string; dob: string; taxId: string; address: string }) {
  return (
    <Body>
      <PageTitle label="Step 5 of 5" title="Sign agreements" subtitle="Review and sign to open your Alpaca Securities account." />
      <div className="space-y-3 mb-5">
        {[
          {
            icon: FileText,
            title: "W-8BEN — Certificate of Foreign Status",
            detail: `Certifies that ${name} is a non-US person for US withholding tax. DOB: ${dob}. Tax ID: ${taxId}. Address: ${address}.`,
            color: "green",
          },
          { icon: FileCheck, title: "Customer Account Agreement", detail: "Governs the terms and conditions of your brokerage account with Alpaca Securities LLC." },
          { icon: FileCheck, title: "Margin Agreement", detail: "Authorises Alpaca to extend margin credit. You understand margin involves risk of loss exceeding deposits." },
          { icon: FileCheck, title: "ACH Transfer Agreement", detail: "Authorises Alpaca to initiate ACH debits and credits on your linked bank account." },
        ].map((a) => (
          <div key={a.title} className="border border-gray-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <a.icon size={16} className="text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-gray-900 leading-tight">{a.title}</p>
                  <span className="shrink-0 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Signed</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{a.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <InfoBox>
        IP address: 192.168.1.10 · Signed: 1 December 2025 · Approved by: Auto-approval (CCO)
      </InfoBox>
    </Body>
  );
}

/* ─── 13b. EDD ─── */
export function EDDScreen({ name }: { name: string }) {
  return (
    <Body>
      <PageTitle label="Step 5 of 5" title="Enhanced Due Diligence" subtitle="Our compliance team requires additional information to complete your application." />
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-5 text-sm text-amber-800">
        <strong>Watchlist match detected.</strong> Your name has returned a potential match. This does not mean you have done anything wrong — we need to confirm your identity and conduct EDD.
      </div>
      <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100 mb-5">
        <DataRow label="Full legal name" value={name} />
        <DataRow label="Current employer" value="Emirates Investment Authority" />
        <DataRow label="Role / position" value="Senior Manager — Asset Management" />
        <DataRow label="Nature of match" value="Name similarity · PEP adjacent · Adverse media" />
        <DataRow label="PEP declaration" value="I confirm I am not a PEP or sanctioned individual" />
        <DataRow label="Watchlist match reviewed" value="False positive — confirmed by compliance team" />
        <DataRow label="Supporting docs uploaded" value="Bank statement (3 months), Employment letter" />
        <DataRow label="EDD approval reason" value="Watchlist hits investigated and deemed false positives. Non-matching DOB on PEP record. Address history inconsistent with hit profile." />
      </div>
      <InfoBox>
        Your EDD responses and documents have been submitted to the Aspora compliance team (AMLCO: Mohammed Al-Zarooni). Approved by: CCO — approval_status: approved.
      </InfoBox>
    </Body>
  );
}

/* ─── 13c. Identity Review ─── */
export function IdentityReviewScreen({ name }: { name: string }) {
  return (
    <Body>
      <PageTitle label="Step 5 of 5" title="Document re-submission" subtitle="We need clearer images to complete your identity verification." />
      <div className="p-4 bg-red-50 border border-red-200 rounded-2xl mb-5 text-sm text-red-800">
        <strong>Image quality issue.</strong> Your document photo and selfie did not meet our minimum quality thresholds. Please re-upload.
      </div>
      <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100 mb-5">
        <div className="px-4 py-3 flex items-start justify-between gap-3">
          <span className="text-xs text-gray-600">Face comparison score</span>
          <span className="text-xs font-bold text-amber-700 text-right">75 / 100 (min: 80)</span>
        </div>
        <div className="px-4 py-3 flex items-start justify-between gap-3">
          <span className="text-xs text-gray-600">Visual authenticity score</span>
          <span className="text-xs font-bold text-amber-700 text-right">40 / 100 (min: 70)</span>
        </div>
        <div className="px-4 py-3 flex items-start justify-between gap-3">
          <span className="text-xs text-gray-600">Document image quality</span>
          <span className="text-xs font-bold text-amber-700 text-right">Consider — resolution insufficient</span>
        </div>
        <div className="px-4 py-3 flex items-start justify-between gap-3">
          <span className="text-xs text-gray-600">Data comparison</span>
          <span className="text-xs font-bold text-amber-700 text-right">Consider — DOB, name, gender mismatch</span>
        </div>
        <DataRow label="EDD action" value="Manual review of documents + selfie. Specialist confirmed a match." />
      </div>
      <div className="space-y-3 mb-5">
        {[
          { icon: CreditCard, label: "Emirates ID — front (re-upload)" },
          { icon: CreditCard, label: "Emirates ID — back (re-upload)" },
          { icon: Camera, label: "Selfie photo (re-upload)" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3 border border-green-300 bg-green-50 rounded-2xl px-4 py-3">
            <div className="w-8 h-8 bg-white border border-green-200 rounded-lg flex items-center justify-center">
              <item.icon size={16} className="text-gray-500" />
            </div>
            <span className="text-sm text-gray-700 flex-1">{item.label}</span>
            <CheckCircle size={18} className="text-green-600" />
          </div>
        ))}
      </div>
      <InfoBox>Documents submitted for {name}. Compliance review within 1–2 business days.</InfoBox>
    </Body>
  );
}

/* ─── 14. Account Approved ─── */
export function AccountApprovedScreen({ accountNumber, name }: { accountNumber: string; name: string }) {
  return (
    <Body>
      <div className="flex flex-col items-center justify-center min-h-[65vh] text-center">
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <CheckCircle size={48} className="text-green-600" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-green-600 mb-2">Approved</p>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Account opened!</h1>
        <p className="text-sm text-gray-500 max-w-xs mb-8">
          Welcome, {name.split(" ")[0]}. Your Aspora investment account is live and ready.
        </p>
        <div className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-5 text-left space-y-0">
          <DataRow label="Account number" value={accountNumber} />
          <DataRow label="Account type" value="Individual Brokerage (US Equities)" />
          <DataRow label="Status" value="Active" />
          <DataRow label="Currency" value="USD" />
          <DataRow label="Broker" value="Alpaca Securities LLC (FINRA / SIPC)" />
          <DataRow label="KYC result" value="All Clear — Auto-approved" />
          <DataRow label="Approved by" value="System (CCO: Aspora Compliance)" />
          <DataRow label="Approved reason" value="All checks cleared — no flags detected" />
        </div>
      </div>
    </Body>
  );
}

/* ─── 14b/c. Account Opened — Consider Cleared ─── */
export function ConsiderClearedScreen({ accountNumber, name, reason }: {
  accountNumber: string; name: string; reason: "watchlist" | "identity";
}) {
  const isWatchlist = reason === "watchlist";
  const tag = isWatchlist ? "Watchlist Consider — Cleared" : "Identity Consider — Cleared";
  const tagColor = isWatchlist ? "text-amber-700 bg-amber-100 border-amber-300" : "text-red-700 bg-red-100 border-red-300";
  const eddSummary = isWatchlist
    ? "Enhanced Due Diligence (EDD) completed. All watchlist hits investigated and confirmed as false positives — non-matching DOB and address history. No sanctions risk identified."
    : "Manual document review completed. Specialist confirmed biometric match on re-submitted documents. OCR error on original scan identified and resolved.";
  const approvedBy = isWatchlist
    ? "Mohammed Al-Zarooni (AMLCO, Aspora)"
    : "Aisha Khalid (Compliance Analyst, Aspora)";

  return (
    <Body>
      <div className="flex flex-col items-center min-h-[65vh] pt-4">
        {/* Status */}
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle size={42} className="text-green-600" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-green-600 mb-1">Account Opened</p>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1 text-center">Application approved</h1>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${tagColor} mb-5`}>{tag}</span>

        {/* Account details */}
        <div className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-4 space-y-0">
          <DataRow label="Account number" value={accountNumber} />
          <DataRow label="Applicant" value={name} />
          <DataRow label="Account status" value="ACTIVE" />
          <DataRow label="KYC result" value={tag} />
          <DataRow label="Approved by" value={approvedBy} />
        </div>

        {/* EDD / review summary */}
        <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 mb-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
            {isWatchlist ? "EDD Summary" : "Manual Review Summary"}
          </p>
          <p className="text-xs text-gray-700 leading-relaxed">{eddSummary}</p>
        </div>
      </div>
    </Body>
  );
}
