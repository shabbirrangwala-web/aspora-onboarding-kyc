"use client";

import { FlowRunner, FlowCtx } from "@/components/CIPFlowRunner";
import {
  WelcomeScreen, CountryScreen, VerifyMethodScreen,
  UAEPassScreen, EFRScreen, UploadDocScreen, VerifiedScreen,
  ReviewDetailsScreen, TaxScreen, ContactScreen, EmploymentScreen,
  TradingScreen, DisclosuresScreen, BackgroundCheckScreen,
  IdentityReviewScreen, ConsiderClearedScreen,
} from "@/components/CIPScreens";

const C = {
  name: "Mohammed Jamal Al-Rashidi",
  firstName: "Mohammed", lastName: "Al-Rashidi",
  dob: "8 November 1985", nationality: "Emirati (UAE)",
  documentNumber: "784-1985-9876543-1",
  address: "Apartment 22, Jumeirah Heights, Dubai, UAE",
  email: "mohammed.alrashidi@example.ae", phone: "+971 50 987 6543",
  taxId: "784-1985-9876543-1",
  employer: "Abu Dhabi National Energy Company (TAQA)",
  income: "AED 420,000 / year (~USD 114,000)",
  accountNumber: "282306517",
};

function authScreen(ctx: FlowCtx) {
  if (ctx.verifyMethod === "uaepass") return <UAEPassScreen />;
  if (ctx.verifyMethod === "efr") return <EFRScreen />;
  return <UploadDocScreen ctx={ctx} />;
}

export default function IdentityCIPFlow() {
  return (
    <FlowRunner
      scenarioLabel="Scenario 3 — Identity Consider · Manual Review"
      scenarioHref="/cip/flow/identity"
      reportHref="/cip/identity"
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
          nextLabel: "Re-submit documents",
          screen: () => (
            <BackgroundCheckScreen
              isIdentityScenario
              checkResults={{ doc_quality: "consider", face_match: "consider", doc_auth: "clear", identity: "clear" }}
            />
          ),
        },
        { title: "Document re-submission", nextLabel: "Submit for review", screen: () => <IdentityReviewScreen name={C.name} /> },
        {
          title: "Application submitted",
          screen: () => <ConsiderClearedScreen accountNumber={C.accountNumber} name={C.name} reason="identity" />,
        },
      ]}
    />
  );
}
