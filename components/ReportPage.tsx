"use client";

import Link from "next/link";

export interface ScenarioReport {
  title: string;
  scenario: string;
  status: "clear" | "watchlist_consider" | "identity_consider";
  customer: {
    name: string;
    email: string;
    phone: string;
    dob: string;
    nationality: string;
    country_of_tax_residence: string;
    tax_id: string;
    address: string;
  };
  alpaca: {
    account_id: string;
    account_number: string;
  };
  accountCreation: {
    endpoint: string;
    method: string;
    request: object;
    response: object;
  };
  cipResults: {
    endpoint: string;
    method: string;
    request: object;
    response: object;
  };
}

function StatusBadge({ status }: { status: ScenarioReport["status"] }) {
  const map = {
    clear: { label: "All Clear", cls: "bg-green-100 text-green-800 border-green-300" },
    watchlist_consider: { label: "Watchlist Consider", cls: "bg-amber-100 text-amber-800 border-amber-300" },
    identity_consider: { label: "Identity Consider", cls: "bg-red-100 text-red-800 border-red-300" },
  };
  const { label, cls } = map[status];
  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${cls}`}>{label}</span>
  );
}

function ResultBadge({ value }: { value: string | undefined }) {
  if (!value) return <span className="text-gray-400 text-xs">—</span>;
  const isConsider = value === "consider";
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isConsider ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`}>
      {value}
    </span>
  );
}

function JsonBlock({ data }: { data: object }) {
  return (
    <pre className="text-xs bg-gray-950 text-green-300 rounded-lg p-4 overflow-x-auto leading-relaxed whitespace-pre-wrap break-all font-mono">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3 border-b border-gray-200 pb-2">
        {title}
      </h2>
      {children}
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500 w-44 shrink-0">{label}</span>
      <span className="text-xs font-medium text-gray-900 break-all">{value}</span>
    </div>
  );
}

export default function ReportPage({ report }: { report: ScenarioReport }) {
  const cipResp = report.cipResults.response as Record<string, unknown>;
  const results = (cipResp.results || {}) as Record<string, unknown>;
  const identity = (results.identity || {}) as Record<string, unknown>;
  const document_ = (results.document || {}) as Record<string, unknown>;
  const photo = (results.photo || {}) as Record<string, unknown>;
  const watchlist = (results.watchlist || {}) as Record<string, unknown>;

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Toolbar */}
      <div className="no-print sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-sm text-gray-500 hover:text-black flex items-center gap-1">
          ← All Scenarios
        </Link>
        <div className="flex items-center gap-3">
          <StatusBadge status={report.status} />
          <button
            onClick={() => window.print()}
            className="text-xs bg-black text-white px-4 py-1.5 rounded-full font-semibold hover:bg-gray-800 transition-colors"
          >
            Print / Save PDF
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 print:py-4 print:px-0">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 print:shadow-none print:border-gray-300">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">A</span>
                </div>
                <span className="font-bold text-gray-900">Aspora</span>
                <span className="text-gray-300">×</span>
                <span className="text-gray-500 text-sm">Alpaca Broker API Sandbox</span>
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 mt-2">{report.title}</h1>
              <p className="text-gray-500 text-sm">{report.scenario}</p>
            </div>
            <StatusBadge status={report.status} />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Customer</p>
              <p className="font-bold text-gray-900">{report.customer.name}</p>
              <p className="text-xs text-gray-500">{report.customer.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Account</p>
              <p className="font-bold text-gray-900">#{report.alpaca.account_number}</p>
              <p className="text-xs text-gray-500 font-mono">{report.alpaca.account_id}</p>
            </div>
          </div>
        </div>

        {/* CIP Result Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 print:shadow-none print:border-gray-300">
          <Section title="CIP Results Summary">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Document", value: (document_ as Record<string,string>).result },
                { label: "Photo", value: (photo as Record<string,string>).result },
                { label: "Identity", value: (identity as Record<string,string>).result },
                { label: "Watchlist", value: (watchlist as Record<string,string>).result },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                  <ResultBadge value={value} />
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Customer Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 print:shadow-none print:border-gray-300">
          <Section title="Customer Details">
            <KV label="Full Name" value={report.customer.name} />
            <KV label="Date of Birth" value={report.customer.dob} />
            <KV label="Email" value={report.customer.email} />
            <KV label="Phone" value={report.customer.phone} />
            <KV label="Nationality" value={report.customer.nationality} />
            <KV label="Country of Tax Residence" value={report.customer.country_of_tax_residence} />
            <KV label="Tax ID" value={report.customer.tax_id} />
            <KV label="Address" value={report.customer.address} />
          </Section>
        </div>

        {/* Account Creation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 print:shadow-none print:border-gray-300">
          <Section title="Account Creation API">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{report.accountCreation.method}</span>
              <span className="text-xs font-mono text-gray-600">{report.accountCreation.endpoint}</span>
            </div>
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Request Payload</p>
              <JsonBlock data={report.accountCreation.request} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Response Payload</p>
              <JsonBlock data={report.accountCreation.response} />
            </div>
          </Section>
        </div>

        {/* CIP Results */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 print:shadow-none print:border-gray-300">
          <Section title="CIP Results API">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">{report.cipResults.method}</span>
              <span className="text-xs font-mono text-gray-600">{report.cipResults.endpoint}</span>
            </div>
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Request Payload</p>
              <JsonBlock data={report.cipResults.request} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Response Payload</p>
              <JsonBlock data={report.cipResults.response} />
            </div>
          </Section>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8 print:mt-4">
          Aspora · Alpaca Broker API Sandbox · Generated for CIP review
        </p>
      </div>
    </div>
  );
}
