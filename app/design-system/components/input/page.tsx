"use client";

import * as React from "react";
import { PageShell } from "@/components/design-system/PageShell";
import { Input, SearchInput, MaskedInput, CodeInput, MultilineInput, PhoneInput } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mail, DollarSign } from "lucide-react";

export default function InputPage() {
  const [search, setSearch] = React.useState("");
  const [code, setCode] = React.useState("");

  return (
    <PageShell title="Input">
      <Card padding="lg" className="flex flex-col gap-16">
        <div className="flex flex-col gap-4">
          <span className="type-overline text-on-surface-tertiary">Text input</span>
        </div>
        <div className="flex flex-col gap-12">
          <Input label="Email" placeholder="you@example.com" />
          <Input label="Amount" placeholder="0.00" leadingIcon={<DollarSign className="h-20 w-20" />} />
          <Input label="Email" placeholder="Optional field" optional trailingIcon={<Mail className="h-20 w-20" />} />
        </div>
      </Card>

      <Card padding="lg" className="flex flex-col gap-16">
        <div className="flex flex-col gap-4">
          <span className="type-overline text-on-surface-tertiary">States</span>
        </div>
        <div className="flex flex-col gap-12">
          <Input label="Error" defaultValue="invalid@" error="Please enter a valid email" />
          <Input label="Success" defaultValue="valid@email.com" success="Email verified" />
          <Input label="Helper" placeholder="Enter value" helper="This is a hint" />
          <Input label="Disabled" placeholder="Can't edit" disabled />
        </div>
      </Card>

      <Card padding="lg" className="flex flex-col gap-16">
        <div className="flex flex-col gap-4">
          <span className="type-overline text-on-surface-tertiary">Search input</span>
          <p className="type-bodySm text-on-surface-secondary">Pill-shaped with leading search icon.</p>
        </div>
        <SearchInput
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch("")}
        />
      </Card>

      <Card padding="lg" className="flex flex-col gap-16">
        <div className="flex flex-col gap-4">
          <span className="type-overline text-on-surface-tertiary">Masked input</span>
          <p className="type-bodySm text-on-surface-secondary">Password with eye toggle.</p>
        </div>
        <MaskedInput label="Password" placeholder="Enter password" />
      </Card>

      <Card padding="lg" className="flex flex-col gap-16">
        <div className="flex flex-col gap-4">
          <span className="type-overline text-on-surface-tertiary">Code input</span>
          <p className="type-bodySm text-on-surface-secondary">Individual digit boxes for OTP.</p>
        </div>
        <CodeInput label="Verification code" value={code} onChange={setCode} />
        <CodeInput label="With error" value="12" error="Invalid code" />
      </Card>

      <Card padding="lg" className="flex flex-col gap-16">
        <div className="flex flex-col gap-4">
          <span className="type-overline text-on-surface-tertiary">Multi-line input</span>
          <p className="type-bodySm text-on-surface-secondary">Textarea with optional character count.</p>
        </div>
        <MultilineInput label="Description" placeholder="Tell us more..." />
        <MultilineInput label="Bio" placeholder="Write your bio" showCharacterCount maxLength={200} optional />
        <MultilineInput label="Error state" defaultValue="Invalid content" error="Please fix the errors above" />
        <MultilineInput label="Disabled" placeholder="Can't edit" disabled />
      </Card>

      <Card padding="lg" className="flex flex-col gap-16">
        <div className="flex flex-col gap-4">
          <span className="type-overline text-on-surface-tertiary">Phone input</span>
          <p className="type-bodySm text-on-surface-secondary">Country code selector with phone number.</p>
        </div>
        <PhoneInput placeholder="(555) 000-0000" />
        <PhoneInput label="UK number" countryCode="+44" countryFlag="🇬🇧" placeholder="20 7946 0958" />
        <PhoneInput label="Phone" placeholder="Enter number" error="Invalid phone number" />
        <PhoneInput label="Phone" placeholder="Enter number" optional disabled />
      </Card>
    </PageShell>
  );
}
