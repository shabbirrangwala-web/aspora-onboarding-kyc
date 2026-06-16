import ReportPage from "@/components/ReportPage";

const ACCOUNT_ID = "f8b23e36-a976-4e11-93a8-8426eb1b08ca";
const ACCOUNT_NUMBER = "282306517";

const accountCreationRequest = {
  contact: {
    email_address: "mohammed.alrashidi@example.ae",
    phone_number: "+971509876543",
    street_address: ["Apartment 22, Jumeirah Heights"],
    city: "Dubai",
    state: "",
    postal_code: "",
    country: "UAE"
  },
  identity: {
    given_name: "Mohammed",
    middle_name: "Jamal",
    family_name: "Al-Rashidi",
    date_of_birth: "1985-11-08",
    tax_id: "784-1985-9876543-1",
    tax_id_type: "OTHER",
    country_of_citizenship: "ARE",
    country_of_birth: "ARE",
    country_of_tax_residence: "ARE",
    funding_source: ["employment_income", "savings"]
  },
  disclosures: {
    is_control_person: false,
    is_affiliated_exchange_or_finra: false,
    is_politically_exposed: false,
    immediate_family_exposed: false
  },
  agreements: [
    { agreement: "margin_agreement", signed_at: "2025-12-10T14:00:00Z", ip_address: "192.168.1.55" },
    { agreement: "account_agreement", signed_at: "2025-12-10T14:00:00Z", ip_address: "192.168.1.55" },
    { agreement: "customer_agreement", signed_at: "2025-12-10T14:00:00Z", ip_address: "192.168.1.55" }
  ],
  documents: [
    { document_type: "identity_verification", document_sub_type: "national_identity_card", content: "BASE64_ENCODED_IMAGE_DATA", mime_type: "image/jpeg" }
  ],
  trusted_contact: { given_name: "Sara", family_name: "Al-Rashidi", email_address: "sara.alrashidi@example.ae" },
  enabled_assets: ["us_equity"]
};

const accountCreationResponse = {
  id: ACCOUNT_ID,
  account_number: ACCOUNT_NUMBER,
  status: "SUBMITTED",
  crypto_status: "INACTIVE",
  currency: "USD",
  last_equity: "0",
  created_at: "2025-12-10T14:01:08.211Z",
  contact: accountCreationRequest.contact,
  identity: accountCreationRequest.identity,
  disclosures: accountCreationRequest.disclosures,
  agreements: accountCreationRequest.agreements,
  trusted_contact: accountCreationRequest.trusted_contact,
  enabled_assets: ["us_equity"]
};

const cipRequest = {
  provider_name: ["onfido", "jumio"],
  kyc: {
    id: "kyc-identity-f8b23e36",
    risk_score: "45",
    risk_level: "MEDIUM",
    risk_categories: ["document_quality_risk", "biometric_mismatch_risk"],
    applicant_name: "Mohammed Jamal Al-Rashidi",
    email_address: "mohammed.alrashidi@example.ae",
    nationality: "ARE",
    id_number: "784-1985-9876543-1",
    date_of_birth: "1985-11-08",
    address: "Apartment 22, Jumeirah Heights, Dubai, UAE",
    postal_code: "",
    country_of_residency: "ARE",
    kyc_completed_at: "2025-12-12T10:15:00Z",
    ip_address: "192.168.1.55",
    check_initiated_at: "2025-12-10T14:01:30Z",
    check_completed_at: "2025-12-10T14:09:50Z",
    approval_status: "approved",
    approved_by: "Aisha Khalid (Compliance Analyst, Aspora)",
    approved_reason: "Manual review of re-submitted documents and selfie conducted. A specialist confirmed a biometric match upon review of the higher-resolution re-upload. Original face comparison score of 75 was caused by partial face obstruction in the initial selfie — re-submitted selfie scored 94. Data comparison mismatches (first_name, last_name, DOB, gender) were due to OCR extraction error on the initial low-resolution Emirates ID scan — re-submitted document confirmed correct data. Document authenticity confirmed. Watchlist all clear. Account approved post-EDD.",
    approved_at: "2025-12-12T10:15:00Z"
  },
  document: {
    id: "doc-identity-f8b23e36",
    result: "consider",
    status: "complete",
    created_at: "2025-12-10T14:05:00Z",
    first_name: "Mohammed",
    last_name: "Al-Rashidi",
    gender: "Male",
    date_of_birth: "1985-11-08",
    date_of_expiry: "2028-11-08",
    issuing_country: "ARE",
    nationality: "ARE",
    document_numbers: [{ type: "document_number", value: "784-1985-9876543-1" }],
    document_type: "national_identity_card",
    age_validation: "clear",
    compromised_document: "clear",
    police_record: "clear",
    data_comparison: "consider",
    data_comparison_breakdown: {
      issuing_country: "clear",
      date_of_expiry: "clear",
      document_numbers: "clear",
      document_type: "clear",
      first_name: "consider",
      gender: "consider",
      date_of_birth: "consider",
      last_name: "consider"
    },
    image_integrity: "consider",
    image_integrity_breakdown: {
      colour_picture: "clear",
      conclusive_document_quality: "consider",
      image_quality: "consider",
      supported_document: "clear"
    },
    visual_authenticity: {
      digital_tampering: "clear",
      face_detection: "clear",
      fonts: "clear",
      original_document_present: "clear",
      picture_face_integrity: "clear",
      security_features: "clear",
      template: "clear"
    }
  },
  photo: {
    id: "photo-identity-f8b23e36",
    result: "consider",
    status: "complete",
    created_at: "2025-12-10T14:06:00Z",
    face_comparison: "consider",
    face_comparison_breakdown: {
      face_match: { result: "consider", properties: { score: "75" } }
    },
    image_integrity: "consider",
    image_integrity_breakdown: {
      face_detected: "clear",
      source_integrity: "consider"
    },
    visual_authenticity: "consider",
    visual_authenticity_breakdown: {
      spoofing_detection: { result: "consider", properties: { score: "40" } }
    }
  },
  identity: {
    id: "identity-identity-f8b23e36",
    result: "clear",
    status: "complete",
    created_at: "2025-12-10T14:07:00Z",
    matched_address: "clear",
    matched_addresses: [
      { id: "addr-003", match_types: ["government_database", "voting_register"] }
    ],
    sources: "clear",
    sources_breakdown: {
      total_sources: { result: "clear", properties: { total_number_of_sources: "2" } }
    },
    address: "clear",
    address_breakdown: {
      government_database: { result: "clear", properties: { number_of_matches: "1" } }
    },
    date_of_birth: "clear",
    date_of_birth_breakdown: {
      government_database: { result: "clear", properties: { number_of_matches: "1" } }
    },
    tax_id: "clear",
    tax_id_breakdown: {
      result: "clear",
      notes: "National identification number was verified via UAE government database"
    }
  },
  watchlist: {
    id: "watchlist-identity-f8b23e36",
    result: "clear",
    status: "complete",
    created_at: "2025-12-10T14:08:00Z",
    politically_exposed_person: "clear",
    sanction: "clear",
    adverse_media: "clear",
    monitored_lists: "clear",
    records: []
  }
};

const cipResponse = {
  id: "cip-identity-f8b23e36",
  account_id: ACCOUNT_ID,
  created_at: "2025-12-10T14:10:00Z",
  updated_at: "2025-12-12T10:15:00Z",
  provider_name: ["onfido", "jumio"],
  kyc: { id: "kyc-identity-f8b23e36", result: "consider", status: "complete", approval_status: "approved" },
  results: {
    document: {
      id: "doc-identity-f8b23e36",
      result: "consider",
      status: "complete",
      image_integrity: "consider",
      image_integrity_breakdown: {
        conclusive_document_quality: "consider",
        image_quality: "consider"
      },
      data_comparison: "consider",
      data_comparison_breakdown: {
        date_of_birth: "consider",
        first_name: "consider",
        gender: "consider",
        last_name: "consider"
      }
    },
    photo: {
      id: "photo-identity-f8b23e36",
      result: "consider",
      status: "complete",
      face_comparison: "consider",
      face_comparison_breakdown: {
        face_match: { result: "consider", properties: { score: "75" } }
      },
      visual_authenticity: "consider",
      visual_authenticity_breakdown: {
        spoofing_detection: { result: "consider", properties: { score: "40" } }
      }
    },
    identity: { id: "identity-identity-f8b23e36", result: "clear", status: "complete" },
    watchlist: { id: "watchlist-identity-f8b23e36", result: "clear", status: "complete" }
  }
};

export default function IdentityReport() {
  return (
    <ReportPage
      report={{
        title: "Scenario 3 — Identity Consider",
        scenario: "Document image quality and photo biometric checks return consider. Face match score 75, visual authenticity score 40. Manual review conducted — specialist confirmed match on re-submission. Account approved.",
        status: "identity_consider",
        customer: {
          name: "Mohammed Jamal Al-Rashidi",
          email: "mohammed.alrashidi@example.ae",
          phone: "+971509876543",
          dob: "1985-11-08",
          nationality: "Emirati (ARE)",
          country_of_tax_residence: "UAE",
          tax_id: "784-1985-9876543-1",
          address: "Apartment 22, Jumeirah Heights, Dubai, UAE",
        },
        alpaca: { account_id: ACCOUNT_ID, account_number: ACCOUNT_NUMBER },
        accountCreation: {
          endpoint: "https://broker-api.sandbox.alpaca.markets/v1/accounts",
          method: "POST",
          request: accountCreationRequest,
          response: accountCreationResponse,
        },
        cipResults: {
          endpoint: `https://broker-api.sandbox.alpaca.markets/v1/accounts/${ACCOUNT_ID}/cip`,
          method: "POST",
          request: cipRequest,
          response: cipResponse,
        },
      }}
    />
  );
}
