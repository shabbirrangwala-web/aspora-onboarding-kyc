"use client";

import { FlowRunner, FlowCtx } from "@/components/CIPFlowRunner";
import {
  WelcomeScreen, CountryScreen, VerifyMethodScreen,
  UAEPassScreen, EFRScreen, UploadDocScreen, VerifiedScreen,
  ReviewDetailsScreen, TaxScreen, ContactScreen, EmploymentScreen,
  TradingScreen, DisclosuresScreen, BackgroundCheckScreen,
  AgreementsScreen, AccountApprovedScreen,
} from "@/components/CIPScreens";

const C = {
  name: "Khalid Saeed Al-Mansoori",
  firstName: "Khalid", lastName: "Al-Mansoori",
  dob: "15 March 1992", nationality: "Emirati (UAE)",
  documentNumber: "784-1992-1234567-8",
  address: "Villa 12, Al Barsha 2, Dubai, UAE",
  email: "khalid.almansoori@example.ae", phone: "+971 50 123 4567",
  taxId: "784-1992-1234567-8",
  employer: "Majid Al Futtaim Group",
  income: "AED 360,000 / year (~USD 98,000)",
  accountNumber: "280862283",
};

function authScreen(ctx: FlowCtx) {
  if (ctx.verifyMethod === "uaepass") return <UAEPassScreen />;
  if (ctx.verifyMethod === "efr") return <EFRScreen />;
  return <UploadDocScreen ctx={ctx} />;
}

export default function HappyCIPFlow() {
  return (
    <FlowRunner
      scenarioLabel="Scenario 1 — Happy Flow · All Clear"
      scenarioHref="/cip/flow/happy"
      reportHref="/cip/happy"
      steps={[
        { title: "Welcome", nextLabel: "Get started", screen: () => <WelcomeScreen name={C.name} /> },
        { title: "Country of residence", screen: () => <CountryScreen /> },
        {
          title: "Identity verification",
          nextLabel: "Continue",
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
          nextLabel: "Review agreements",
          screen: () => (
            <BackgroundCheckScreen checkResults={{ ofac: "clear", pep: "clear", aml: "clear", adverse: "clear" }} />
          ),
        },
        {
          title: "Agreements",
          nextLabel: "Submit application",
          screen: () => (
            <AgreementsScreen name={C.name} dob={C.dob} taxId={C.taxId} address={C.address} />
          ),
        },
        { title: "Account approved", screen: () => <AccountApprovedScreen accountNumber={C.accountNumber} name={C.name} /> },
      ].map((s) => ({ ...s, title: s.title || "" }))}
    />
  );
}
