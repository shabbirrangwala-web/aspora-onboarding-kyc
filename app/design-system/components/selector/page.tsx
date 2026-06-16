"use client";

import { useState } from "react";
import { PageShell } from "@/components/design-system/PageShell";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Radio } from "@/components/ui/radio";
import { Toggle } from "@/components/ui/toggle";

export default function SelectorPage() {
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(true);
  const [radio, setRadio] = useState("option1");
  const [toggle1, setToggle1] = useState(false);
  const [toggle2, setToggle2] = useState(true);

  return (
    <PageShell title="Selector">
      <Card padding="lg" className="flex flex-col gap-16">
        {/* Checkbox */}
        <div className="flex flex-col gap-4">
          <span className="type-overline text-on-surface-tertiary">Checkbox</span>
          <div className="flex flex-col gap-12">
            <Checkbox
              checked={check1}
              onChange={setCheck1}
              label="Unchecked"
            />
            <Checkbox
              checked={check2}
              onChange={setCheck2}
              label="Checked"
            />
            <Checkbox
              checked={false}
              disabled
              label="Disabled unchecked"
            />
            <Checkbox
              checked={true}
              disabled
              label="Disabled checked"
            />
          </div>
        </div>

        {/* Radio */}
        <div className="flex flex-col gap-4">
          <span className="type-overline text-on-surface-tertiary">Radio</span>
          <div className="flex flex-col gap-12">
            <Radio
              checked={radio === "option1"}
              value="option1"
              onChange={setRadio}
              label="Option 1"
              name="demo-radio"
            />
            <Radio
              checked={radio === "option2"}
              value="option2"
              onChange={setRadio}
              label="Option 2"
              name="demo-radio"
            />
            <Radio
              checked={radio === "option3"}
              value="option3"
              onChange={setRadio}
              label="Option 3"
              name="demo-radio"
            />
          </div>
        </div>

        {/* Toggle */}
        <div className="flex flex-col gap-4">
          <span className="type-overline text-on-surface-tertiary">Toggle</span>
          <div className="flex flex-col gap-12">
            <Toggle
              checked={toggle1}
              onChange={setToggle1}
              label="Off"
            />
            <Toggle
              checked={toggle2}
              onChange={setToggle2}
              label="On"
            />
            <Toggle
              checked={false}
              disabled
              label="Disabled off"
            />
            <Toggle
              checked={true}
              disabled
              label="Disabled on"
            />
          </div>
        </div>
      </Card>
    </PageShell>
  );
}
