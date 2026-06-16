"use client";

import { useState } from "react";
import { PageShell } from "@/components/design-system/PageShell";
import { ListItem } from "@/components/ui/list-item";
import { Tag } from "@/components/ui/tag";
import { Card } from "@/components/ui/card";
import { User, Wallet, Home, TrendingUp, Settings, CreditCard, Bell, Shield, Globe } from "lucide-react";

export default function ListItemPage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("usd");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  return (
    <PageShell title="List item">
      {/* Navigation type */}
      <Card padding="none" className="flex flex-col overflow-hidden">
        <ListItem
          type="navigation"
          leading={<User className="h-24 w-24" />}
          title="Account"
          description="Profile, security, KYC"
          onPress={() => {}}
        />
        <ListItem
          type="navigation"
          leading={<Wallet className="h-24 w-24" />}
          title="Wallets"
          description="2 connected"
          trailing={<Tag color="success" type="tinted" size="small">Active</Tag>}
          onPress={() => {}}
        />
        <ListItem
          type="navigation"
          leading={<Home className="h-24 w-24" />}
          title="Address"
          onPress={() => {}}
        />
        <ListItem
          type="no-action"
          leading={<TrendingUp className="h-24 w-24" />}
          title="Performance"
          description="All-time"
          trailingRow1="$1,234.56"
          trailingRow2="+12.4%"
        />
        <ListItem
          type="navigation"
          leading={<Settings className="h-24 w-24" />}
          title="Settings"
          onPress={() => {}}
        />
        <ListItem
          type="navigation"
          leading={<CreditCard className="h-24 w-24" />}
          title="Payment methods"
          description="Visa ••4242"
          tertiary="Expires 12/27"
          showDivider={false}
          onPress={() => {}}
        />
      </Card>

      {/* Toggle type */}
      <Card padding="none" className="flex flex-col overflow-hidden">
        <ListItem
          type="toggle"
          leading={<Bell className="h-24 w-24" />}
          title="Notifications"
          description="Push and email alerts"
          checked={notificationsEnabled}
          onCheckedChange={setNotificationsEnabled}
        />
        <ListItem
          type="toggle"
          leading={<Shield className="h-24 w-24" />}
          title="Biometrics"
          description="Face ID or fingerprint"
          checked={biometricsEnabled}
          onCheckedChange={setBiometricsEnabled}
          showDivider={false}
        />
      </Card>

      {/* Radio type */}
      <Card padding="none" className="flex flex-col overflow-hidden">
        <ListItem
          type="radio"
          title="USD"
          description="US Dollar"
          checked={selectedCurrency === "usd"}
          onCheckedChange={() => setSelectedCurrency("usd")}
        />
        <ListItem
          type="radio"
          title="EUR"
          description="Euro"
          checked={selectedCurrency === "eur"}
          onCheckedChange={() => setSelectedCurrency("eur")}
        />
        <ListItem
          type="radio"
          title="GBP"
          description="British Pound"
          checked={selectedCurrency === "gbp"}
          onCheckedChange={() => setSelectedCurrency("gbp")}
          showDivider={false}
        />
      </Card>

      {/* Checkbox type */}
      <Card padding="none" className="flex flex-col overflow-hidden">
        <ListItem
          type="checkbox"
          title="I agree to the Terms of Service"
          checked={agreedToTerms}
          onCheckedChange={setAgreedToTerms}
          showDivider={false}
        />
      </Card>

      {/* Button type */}
      <Card padding="none" className="flex flex-col overflow-hidden">
        <ListItem
          type="button"
          leading={<Globe className="h-24 w-24" />}
          title="Language"
          description="English (US)"
          buttonLabel="Change"
          onButtonPress={() => {}}
          showDivider={false}
        />
      </Card>
    </PageShell>
  );
}
