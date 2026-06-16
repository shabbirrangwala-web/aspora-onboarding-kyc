"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type KYCScenario = "happy" | "watchlist" | "identity";
export type KYCCountry = "uae" | "uk";
export type KYCIDMethod =
  | "uaepass"
  | "efr"
  | "emirates_id"
  | "passport"
  | "non_doc"
  | "brp"
  | "driving_licence"
  | "share_code";

export interface KYCIdentityData {
  firstName: string;
  lastName: string;
  middleName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  idNumber: string;
  documentType: string;
}

export interface KYCFinancialData {
  employmentStatus: string;
  employerName: string;
  employerAddress: string;
  occupation: string;
  fundingSource: string;
  annualIncome: string;
  liquidNetWorth: string;
  totalNetWorth: string;
  // Risk & goals
  investmentObjective: string;
  riskTolerance: string;
  liquidityNeeds: string;
  // Trading experience
  equitiesExperience: string;
  optionsExperience: string;
  // Trusted contact (optional)
  trustedContactFirstName: string;
  trustedContactLastName: string;
  trustedContactEmail: string;
  trustedContactPhone: string;
}

export interface KYCDeclarationData {
  finraAffiliated: boolean;
  controlPerson: boolean;
  pepSelf: boolean;
  pepFamily: boolean;
  noneApply: boolean;
}

export interface KYCAffiliationData {
  companyName: string;
  companyAddress: string;
  complianceEmail: string;
  tickerSymbol: string; // only required for control persons / public company
  letterUploaded: boolean;
  // Interested party — only needed if firm requires duplicate statements/confirms
  firmRequiresDuplicates: boolean;
  interestedPartyFirstName: string;
  interestedPartyLastName: string;
  interestedPartyTitle: string;
  interestedPartyEmail: string;
  interestedPartyPhone: string;
}

export interface KYCState {
  scenario: KYCScenario | null;
  country: KYCCountry | null;
  idMethod: KYCIDMethod | null;
  identityData: KYCIdentityData | null;
  selfieScore: number | null;
  poaRequired: boolean;
  poaCompleted: boolean;
  poaAddress: string;
  // Address sub-fields
  addressStreet: string;
  addressUnit: string;
  addressCity: string;
  addressPostalCode: string;
  addressState: string;
  // Contact details
  contactEmail: string;
  contactPhone: string;
  taxId: string;
  taxIdType: string;
  // Personal profile
  maritalStatus: string;
  dependents: string;
  wbenAcknowledged: boolean;
  financial: KYCFinancialData | null;
  declarations: KYCDeclarationData | null;
  affiliationData: KYCAffiliationData | null;
  screeningStatus: "pending" | "pass" | "review" | null;
  disclosuresAcknowledged: boolean;
  agreementsSigned: boolean;
}

interface KYCCtx {
  state: KYCState;
  hydrated: boolean;
  update: (partial: Partial<KYCState>) => void;
  reset: () => void;
}

const DEFAULT: KYCState = {
  scenario: null,
  country: null,
  idMethod: null,
  identityData: null,
  selfieScore: null,
  poaRequired: false,
  poaCompleted: false,
  poaAddress: "",
  addressStreet: "",
  addressUnit: "",
  addressCity: "",
  addressPostalCode: "",
  addressState: "",
  contactEmail: "",
  contactPhone: "",
  taxId: "",
  taxIdType: "",
  maritalStatus: "",
  dependents: "",
  wbenAcknowledged: false,
  financial: null,
  declarations: null,
  affiliationData: null,
  screeningStatus: null,
  disclosuresAcknowledged: false,
  agreementsSigned: false,
};

const Ctx = createContext<KYCCtx | null>(null);

export function KYCProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<KYCState>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const s = sessionStorage.getItem("aspora-kyc");
      if (s) setState(JSON.parse(s));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) sessionStorage.setItem("aspora-kyc", JSON.stringify(state));
  }, [state, hydrated]);

  return (
    <Ctx.Provider
      value={{
        state,
        hydrated,
        update: (p) => setState((s) => ({ ...s, ...p })),
        reset: () => {
          sessionStorage.removeItem("aspora-kyc");
          setState(DEFAULT);
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useKYC() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useKYC must be inside KYCProvider");
  return c;
}

/** Returns true once sessionStorage has been read into state */
export function useKYCHydrated() {
  return useKYC().hydrated;
}

export function requiresPoA(_country: KYCCountry, method: KYCIDMethod) {
  // BRP: physical card does not include address
  // Emirates ID: physical card scan does not include address
  // Passport: no address on document
  // Share Code: immigration status check only — no address
  return (
    method === "passport" ||
    method === "emirates_id" ||
    method === "brp" ||
    method === "share_code"
  );
}

export const MOCK_DATA: Record<string, KYCIdentityData> = {
  uaepass: {
    firstName: "Shabbir",
    lastName: "Rangwala",
    middleName: "",
    dateOfBirth: "1985-07-26",
    nationality: "Indian",
    address: "Villa 12, Al Barsha 2, Dubai, UAE",
    idNumber: "784-1992-1234567-8",
    documentType: "Emirates ID (via UAEPass)",
  },
  efr: {
    firstName: "Shabbir",
    lastName: "Rangwala",
    middleName: "",
    dateOfBirth: "1985-07-26",
    nationality: "Indian",
    address: "Villa 12, Al Barsha 2, Dubai, UAE",
    idNumber: "784-1992-1234567-8",
    documentType: "Emirates ID (via EFR)",
  },
  emirates_id: {
    firstName: "Shabbir",
    lastName: "Rangwala",
    middleName: "",
    dateOfBirth: "1985-07-26",
    nationality: "Indian",
    address: "",
    idNumber: "784-1992-1234567-8",
    documentType: "Emirates ID",
  },
  passport: {
    firstName: "Shabbir",
    lastName: "Rangwala",
    middleName: "",
    dateOfBirth: "1985-07-26",
    nationality: "Indian",
    address: "",
    idNumber: "P1234567",
    documentType: "Passport",
  },
  non_doc: {
    firstName: "Shabbir",
    lastName: "Rangwala",
    middleName: "",
    dateOfBirth: "1985-07-26",
    nationality: "Indian",
    address: "42 Baker Street, London, W1U 6TY",
    idNumber: "",
    documentType: "Database check",
  },
  brp: {
    firstName: "Shabbir",
    lastName: "Rangwala",
    middleName: "",
    dateOfBirth: "1985-07-26",
    nationality: "Indian",
    address: "", // BRP physical card does not carry address
    idNumber: "ZR 1234567",
    documentType: "Biometric Residence Permit",
  },
  driving_licence: {
    firstName: "Shabbir",
    lastName: "Rangwala",
    middleName: "",
    dateOfBirth: "1985-07-26",
    nationality: "Indian",
    address: "42 Baker Street, London, W1U 6TY",
    idNumber: "ERUKU123456CKE99",
    documentType: "UK Driving Licence",
  },
  share_code: {
    firstName: "Shabbir",
    lastName: "Rangwala",
    middleName: "",
    dateOfBirth: "1985-07-26",
    nationality: "Indian",
    address: "", // Share code verifies immigration status only — no address
    idNumber: "W3X-K9M-R2P",
    documentType: "UK Share Code",
  },
};
