"use client";

export function SpacingScale() {
  const steps = [4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64, 80];
  return (
    <div className="flex flex-col gap-8">
      {steps.map((s) => (
        <div key={s} className="flex items-center gap-12">
          <span className="type-labelMonoMd w-32 text-on-surface-tertiary">{s}</span>
          <div className="h-12 rounded-4 bg-interactive-primary" style={{ width: `${s}px` }} />
        </div>
      ))}
    </div>
  );
}

export function RadiusScale() {
  const steps = [
    { name: "4", value: 4 },
    { name: "8", value: 8 },
    { name: "12", value: 12 },
    { name: "16", value: 16 },
    { name: "20", value: 20 },
    { name: "24", value: 24 },
    { name: "36", value: 36 },
    { name: "full", value: 9999 },
  ];
  return (
    <div className="grid grid-cols-4 gap-12">
      {steps.map((s) => (
        <div key={s.name} className="flex flex-col items-center gap-4">
          <div
            className="h-48 w-48 border border-border-secondary bg-surface-tertiary"
            style={{ borderRadius: `${s.value}px` }}
          />
          <span className="type-labelMd text-on-surface-tertiary">{s.name}</span>
        </div>
      ))}
    </div>
  );
}
