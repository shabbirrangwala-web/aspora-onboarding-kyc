"use client";

import { FlowRunner, FlowCtx } from "@/components/CIPFlowRunner";
import {
  WelcomeScreen, CountryScreen, VerifyMethodScreen,
  UAEPassScreen, EFRScreen, UploadDocScreen, VerifiedScreen,
  ReviewDetailsScreen, TaxScreen, ContactScreen, EmploymentScreen,
  TradingScreen, DisclosuresScreen, BackgroundCheckScreen,
  EDDScreen, ConsiderClearedScreen,
} from "@/components/CIPScreens";

const C = {
  name: "Priya Arjun Nair",
  firstName: "Priya", lastName: "Nair",
  dob: "22 July 1988", nationality: "Indian (IND)",
  documentNumber: "784-1988-7654321-2",
  address: "Flat 4B, Marina Towers, Dubai, UAE",
  email: "priya.nair@example.in", phone: "+91 98765 43210",
  taxId: "784-1988-7654321-2",
  employer: "Emirates Investment Authority",
  income: "AED 480,000 / year (~USD 130,000)",
  accountNumber: "282976320",
};

function authScreen(ctx: FlowCtx) {
  if (ctx.verifyMethod === "uaepass") return <UAEPassScreen />;
  if (ctx.verifyMethod === "efr") return <EFRScreen />;
  return <UploadDocScreen ctx={ctx} />;
}

export default function WatchlistCIPFlow() {
  return (
    <FlowRunner
      scenarioLabel="Scenario 2 — Watchlist Consider · EDD Required"
      scenarioHref="/cip/flow/watchlist"
      reportHref="/cip/watchlist"
      steps={[
        { title: "Welcome", nextLabel: "Get started", screen: () => <WelcomeScreen name={C.name} /> },
        { title: "Country of residence", screen: () => <CountryScreen /> },
        {
          title: "Identity verification",
          canAdvance: () => true,
          screen: (ctx: FlowCtx) => <VerifyMethodScreen ctx={ctx} />,
        },
        { title: "", screen: (ctx: FlowCtx) => authScreen(ctx), nextLabel: "Next" },
        { title: "Identity verified", nextLabel: "Review my details", screen: (ctx: FlowCtx) => <VerifiedScreen ctx={ctx} /> },
        {
          title: "Review details",
          screen: () => (
            <ReviewDetailsScreen firstName={C.firstName} lastName={C.lastName}
              dob={C.dob} nationality={C.nationality}
              documentNumber={C.documentNumber} address={C.address} />
          ),
        },
        { title: "Tax identification", screen: () => <TaxScreen taxId={C.taxId} /> },
        { title: "Contact details", screen: () => <ContactScreen email={C.email} phone={C.phone} /> },
        { title: "Employment & income", screen: () => <EmploymentScreen employer={C.employer} income={C.income} /> },
        { title: "Investment experience", screen: () => <TradingScreen /> },
        { title: "Regulatory disclosures", nextLabel: "Run background check", screen: () => <DisclosuresScreen /> },
        {
          title: "Background check",
          nextLabel: "Provide additional information",
          screen: () => (
            <BackgroundCheckScreen checkResults={{ ofac: "clear", pep: "consider", aml: "consider", adverse: "consider" }} />
          ),
        },
        { title: "Enhanced Due Diligence", nextLabel: "Submit EDD documents", screen: () => <EDDScreen name={C.name} /> },
        {
          title: "Application submitted",
          screen: () => <ConsiderClearedScreen accountNumber={C.accountNumber} name={C.name} reason="watchlist" />,
        },
      ]}
    />
  );
}
