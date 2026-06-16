"use client";
import { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";

export function Screen({ children }: { children: ReactNode }) {
  return <div className="flex flex-col min-h-screen pb-32">{children}</div>;
}

export function TopBar({
  title,
  progress,
  onBack,
  step,
  total,
}: {
  title?: string;
  progress: number;
  onBack?: () => void;
  step: number;
  total: number;
}) {
  return (
    <div className="sticky top-0 bg-white z-10">
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        {onBack && (
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0"
          >
            <ChevronLeft size={18} />
          </button>
        )}
        <div className="flex-1">
          {title && <span className="text-sm font-medium text-gray-700">{title}</span>}
        </div>
        <span className="text-xs text-gray-400">{step}/{total}</span>
      </div>
      <div className="h-0.5 bg-gray-100">
        <div
          className="h-full bg-black transition-all duration-500"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}

export function Body({ children }: { children: ReactNode }) {
  return <div className="px-5 pt-6 flex-1">{children}</div>;
}

export function PageTitle({
  label,
  title,
  subtitle,
}: {
  label?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-7">
      {label && (
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
          {label}
        </p>
      )}
      <h1 className="text-[1.75rem] font-extrabold text-gray-900 leading-tight mb-2">{title}</h1>
      {subtitle && (
        <p className="text-sm text-gray-500 leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}

export function BottomBar({ children }: { children: ReactNode }) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-100 px-5 py-4 z-20">
      {children}
    </div>
  );
}

export function NextBtn({
  label = "Continue",
  onClick,
  disabled,
}: {
  label?: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full font-bold rounded-full py-4 text-sm tracking-wide transition-all ${
        disabled
          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
          : "bg-black text-white active:scale-95"
      }`}
    >
      {label}
    </button>
  );
}

export function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col py-3 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-400 mb-0.5">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}

export function InfoBox({ children }: { children: ReactNode }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm text-gray-600 leading-relaxed">
      {children}
    </div>
  );
}

export function Badge({
  result,
}: {
  result: "clear" | "consider" | "loading" | "pending";
}) {
  if (result === "clear")
    return (
      <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
        Clear
      </span>
    );
  if (result === "consider")
    return (
      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
        Consider
      </span>
    );
  return null;
}
