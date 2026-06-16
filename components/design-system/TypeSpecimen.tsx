"use client";

interface SpecimenProps {
  className: string;
  label: string;
  sample?: string;
}

export function TypeSpecimen({ className, label, sample = "The quick brown fox" }: SpecimenProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-border-primary pb-12 last:border-b-0 last:pb-0">
      <span className="type-labelMd text-on-surface-tertiary">{label}</span>
      <div className={`${className} text-on-surface-primary`}>{sample}</div>
    </div>
  );
}
