import ReportPage from "@/components/ReportPage";

const ACCOUNT_ID = "ea9035fa-64dc-4350-baa8-3c6a68d9c5cc";
const ACCOUNT_NUMBER = "280862283";

const accountCreationRequest = {
  contact: {
    email_address: "khalid.almansoori@example.ae",
    phone_number: "+971501234567",
    street_address: ["Villa 12, Al Barsha 2"],
    city: "Dubai",
    state: "",
    postal_code: "",
    country: "UAE"
  },
  identity: {
    given_name: "Khalid",
    middle_name: "Saeed",
    family_name: "Al-Mansoori",
    date_of_birth: "1992-03-15",
    tax_id: "784-1992-1234567-8",
    tax_id_type: "OTHER",
    country_of_citizenship: "ARE",
    country_of_birth: "ARE",
    country_of_tax_residence: "ARE",
    funding_source: ["employment_income"]
  },
  disclosures: {
    is_control_person: false,
    is_affiliated_exchange_or_finra: false,
    is_politically_exposed: false,
    immediate_family_exposed: false
  },
  agreements: [
    { agreement: "margin_agreement", signed_at: "2025-12-01T09:00:00Z", ip_address: "192.168.1.10" },
    { agreement: "account_agreement", signed_at: "2025-12-01T09:00:00Z", ip_address: "192.168.1.10" },
    { agreement: "customer_agreement", signed_at: "2025-12-01T09:00:00Z", ip_address: "192.168.1.10" }
  ],
  documents: [
    { document_type: "identity_verification", document_sub_type: "passport", content: "BASE64_ENCODED_IMAGE_DATA", mime_type: "image/jpeg" }
  ],
  trusted_contact: { given_name: "Fatima", family_name: "Al-Mansoori", email_address: "fatima.almansoori@example.ae" },
  enabled_assets: ["us_equity"]
};

const accountCreationResponse = {
  id: ACCOUNT_ID,
  account_number: ACCOUNT_NUMBER,
  status: "SUBMITTED",
  crypto_status: "INACTIVE",
  currency: "USD",
  last_equity: "0",
  created_at: "2025-12-01T09:01:22.342Z",
  contact: accountCreationRequest.contact,
  identity: { ...accountCreationRequest.identity },
  disclosures: accountCreationRequest.disclosures,
  agreements: accountCreationRequest.agreements,
  trusted_contact: accountCreationRequest.trusted_contact,
  enabled_assets: ["us_equity"]
};

const cipRequest = {
  provider_name: ["onfido", "jumio"],
  kyc: {
    id: "kyc-happy-ea9035fa",
    risk_score: "10",
    risk_level: "LOW",
    risk_categories: ["geographic_risk"],
    applicant_name: "Khalid Saeed Al-Mansoori",
    email_address: "khalid.almansoori@example.ae",
    nationality: "ARE",
    id_number: "784-1992-1234567-8",
    date_of_birth: "1992-03-15",
    address: "Villa 12, Al Barsha 2, Dubai, UAE",
    postal_code: "",
    country_of_residency: "ARE",
    kyc_completed_at: "2025-12-01T09:10:00Z",
    ip_address: "192.168.1.10",
    check_initiated_at: "2025-12-01T09:01:30Z",
    check_completed_at: "2025-12-01T09:09:50Z",
    approval_status: "approved",
    approved_by: "System (CCO: Aspora Compliance Team)",
    approved_reason: "All checks cleared — document, photo, identity and watchlist all returned clear results. No flags detected. Auto-approved.",
    approved_at: "2025-12-01T09:10:00Z"
  },
  document: {
    id: "doc-happy-ea9035fa",
    result: "clear",
    status: "complete",
    created_at: "2025-12-01T09:05:00Z",
    first_name: "Khalid",
    last_name: "Al-Mansoori",
    gender: "Male",
    date_of_birth: "1992-03-15",
    date_of_expiry: "2030-03-15",
    issuing_country: "ARE",
    nationality: "ARE",
    document_numbers: [{ type: "document_number", value: "A12345678" }],
    document_type: "passport",
    age_validation: "clear",
    compromised_document: "clear",
    police_record: "clear",
    data_comparison: "clear",
    data_comparison_breakdown: {
      issuing_country: "clear",
      date_of_expiry: "clear",
      document_numbers: "clear",
      document_type: "clear",
      first_name: "clear",
      gender: "clear",
      date_of_birth: "clear",
      last_name: "clear"
    },
    image_integrity: "clear",
    image_integrity_breakdown: {
      colour_picture: "clear",
      conclusive_document_quality: "clear",
      image_quality: "clear",
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
    id: "photo-happy-ea9035fa",
    result: "clear",
    status: "complete",
    created_at: "2025-12-01T09:06:00Z",
    face_comparison: "clear",
    face_comparison_breakdown: {
      face_match: { result: "clear", properties: { score: "99" } }
    },
    image_integrity: "clear",
    image_integrity_breakdown: {
      face_detected: "clear",
      source_integrity: "clear"
    },
    visual_authenticity: "clear",
    visual_authenticity_breakdown: {
      spoofing_detection: { result: "clear", properties: { score: "98" } }
    }
  },
  identity: {
    id: "identity-happy-ea9035fa",
    result: "clear",
    status: "complete",
    created_at: "2025-12-01T09:07:00Z",
    matched_address: "clear",
    matched_addresses: [
      { id: "addr-001", match_types: ["government_database", "utility_records"] }
    ],
    sources: "clear",
    sources_breakdown: {
      total_sources: { result: "clear", properties: { total_number_of_sources: "3" } }
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
    id: "watchlist-happy-ea9035fa",
    result: "clear",
    status: "complete",
    created_at: "2025-12-01T09:08:00Z",
    politically_exposed_person: "clear",
    sanction: "clear",
    adverse_media: "clear",
    monitored_lists: "clear",
    records: []
  }
};

const cipResponse = {
  id: "cip-happy-ea9035fa",
  account_id: ACCOUNT_ID,
  created_at: "2025-12-01T09:10:00Z",
  updated_at: "2025-12-01T09:10:00Z",
  provider_name: ["onfido", "jumio"],
  kyc: { id: "kyc-happy-ea9035fa", result: "clear", status: "complete", approval_status: "approved" },
  results: {
    document: { id: "doc-happy-ea9035fa", result: "clear", status: "complete" },
    photo: { id: "photo-happy-ea9035fa", result: "clear", status: "complete" },
    identity: { id: "identity-happy-ea9035fa", result: "clear", status: "complete" },
    watchlist: { id: "watchlist-happy-ea9035fa", result: "clear", status: "complete" }
  }
};

export default function HappyFlowReport() {
  return (
    <ReportPage
      report={{
        title: "Scenario 1 — Happy Flow",
        scenario: "All KYC checks pass with no flags. Account auto-approved.",
        status: "clear",
        customer: {
          name: "Khalid Saeed Al-Mansoori",
          email: "khalid.almansoori@example.ae",
          phone: "+971501234567",
          dob: "1992-03-15",
          nationality: "Emirati (ARE)",
          country_of_tax_residence: "UAE",
          tax_id: "784-1992-1234567-8",
          address: "Villa 12, Al Barsha 2, Dubai, UAE",
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
