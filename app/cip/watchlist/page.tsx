import ReportPage from "@/components/ReportPage";

const ACCOUNT_ID = "cfe73bc1-930d-40e0-9b91-bfe60a0a4bf1";
const ACCOUNT_NUMBER = "282976320";

const accountCreationRequest = {
  contact: {
    email_address: "priya.nair@example.in",
    phone_number: "+919876543210",
    street_address: ["Flat 4B, Marina Towers"],
    city: "Dubai",
    state: "",
    postal_code: "",
    country: "UAE"
  },
  identity: {
    given_name: "Priya",
    middle_name: "Arjun",
    family_name: "Nair",
    date_of_birth: "1988-07-22",
    tax_id: "784-1988-7654321-2",
    tax_id_type: "OTHER",
    country_of_citizenship: "IND",
    country_of_birth: "IND",
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
    { agreement: "margin_agreement", signed_at: "2025-12-05T11:00:00Z", ip_address: "192.168.1.22" },
    { agreement: "account_agreement", signed_at: "2025-12-05T11:00:00Z", ip_address: "192.168.1.22" },
    { agreement: "customer_agreement", signed_at: "2025-12-05T11:00:00Z", ip_address: "192.168.1.22" }
  ],
  documents: [
    { document_type: "identity_verification", document_sub_type: "passport", content: "BASE64_ENCODED_IMAGE_DATA", mime_type: "image/jpeg" }
  ],
  trusted_contact: { given_name: "Arjun", family_name: "Nair", email_address: "arjun.nair@example.in" },
  enabled_assets: ["us_equity"]
};

const accountCreationResponse = {
  id: ACCOUNT_ID,
  account_number: ACCOUNT_NUMBER,
  status: "SUBMITTED",
  crypto_status: "INACTIVE",
  currency: "USD",
  last_equity: "0",
  created_at: "2025-12-05T11:01:14.891Z",
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
    id: "kyc-watchlist-cfe73bc1",
    risk_score: "55",
    risk_level: "MEDIUM",
    risk_categories: ["pep_risk", "adverse_media_risk", "geographic_risk"],
    applicant_name: "Priya Arjun Nair",
    email_address: "priya.nair@example.in",
    nationality: "IND",
    id_number: "784-1988-7654321-2",
    date_of_birth: "1988-07-22",
    address: "Flat 4B, Marina Towers, Dubai, UAE",
    postal_code: "",
    country_of_residency: "ARE",
    kyc_completed_at: "2025-12-07T14:30:00Z",
    ip_address: "192.168.1.22",
    check_initiated_at: "2025-12-05T11:01:30Z",
    check_completed_at: "2025-12-05T11:09:50Z",
    approval_status: "approved",
    approved_by: "Mohammed Al-Zarooni (AMLCO, Aspora)",
    approved_reason: "Watchlist hits were manually investigated and deemed false positives. PEP match #1 had a non-matching DOB (1945-03-12 vs subject 1988-07-22). Adverse media articles (Reuters, Gulf News) relate to a sector-wide regulatory inquiry — subject not personally named. Monitored list match was a name-similarity false positive confirmed via address history cross-check. EDD conducted — employment letter and 3-month bank statement reviewed. No suspicious activity identified. Account approved.",
    approved_at: "2025-12-07T14:30:00Z"
  },
  document: {
    id: "doc-watchlist-cfe73bc1",
    result: "clear",
    status: "complete",
    created_at: "2025-12-05T11:05:00Z",
    first_name: "Priya",
    last_name: "Nair",
    gender: "Female",
    date_of_birth: "1988-07-22",
    date_of_expiry: "2031-07-22",
    issuing_country: "IND",
    nationality: "IND",
    document_numbers: [{ type: "document_number", value: "B98765432" }],
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
    id: "photo-watchlist-cfe73bc1",
    result: "clear",
    status: "complete",
    created_at: "2025-12-05T11:06:00Z",
    face_comparison: "clear",
    face_comparison_breakdown: {
      face_match: { result: "clear", properties: { score: "97" } }
    },
    image_integrity: "clear",
    image_integrity_breakdown: {
      face_detected: "clear",
      source_integrity: "clear"
    },
    visual_authenticity: "clear",
    visual_authenticity_breakdown: {
      spoofing_detection: { result: "clear", properties: { score: "96" } }
    }
  },
  identity: {
    id: "identity-watchlist-cfe73bc1",
    result: "clear",
    status: "complete",
    created_at: "2025-12-05T11:07:00Z",
    matched_address: "clear",
    matched_addresses: [
      { id: "addr-002", match_types: ["credit_agencies", "utility_records"] }
    ],
    sources: "clear",
    sources_breakdown: {
      total_sources: { result: "clear", properties: { total_number_of_sources: "2" } }
    },
    address: "clear",
    address_breakdown: {
      credit_agencies: { result: "clear", properties: { number_of_matches: "1" } }
    },
    date_of_birth: "clear",
    date_of_birth_breakdown: {
      credit_agencies: { result: "clear", properties: { number_of_matches: "1" } }
    },
    tax_id: "clear",
    tax_id_breakdown: {
      result: "clear",
      notes: "National identification number was verified via UAE residency database"
    }
  },
  watchlist: {
    id: "watchlist-watchlist-cfe73bc1",
    result: "consider",
    status: "complete",
    created_at: "2025-12-05T11:08:00Z",
    politically_exposed_person: "consider",
    sanction: "clear",
    adverse_media: "consider",
    monitored_lists: "consider",
    records: [
      {
        id: "record-001",
        type: "politically_exposed_person",
        full_name: "Priya Arjun Nair",
        aliases: ["P. A. Nair", "Priya Nair"],
        addresses: [{ address: "Unnamed Road, Dubai", country: "ARE" }],
        date_of_birth: "1945-03-12",
        positions: ["Director, UAE Investment Authority (associated role — 1998–2002)"],
        edd_outcome: "False positive — non-matching DOB (1945 vs subject 1988). Different individual."
      },
      {
        id: "record-002",
        type: "adverse_media",
        sources: ["Reuters (2023-06-14)", "Gulf News (2023-06-15)"],
        summary: "Subject's name appeared in reporting on a sector-wide UAE financial services regulatory inquiry. Subject not personally named as a party — referenced as an employee of the authority under investigation.",
        url: "https://example-news.com/uae-finance-inquiry-2023",
        edd_outcome: "Reviewed and cleared — subject not personally implicated."
      },
      {
        id: "record-003",
        type: "monitored_lists",
        list_name: "OFAC SDN Adjacent (name-similarity match)",
        match_score: "0.82",
        matched_name: "Priya Nair",
        dob_on_list: "1961-11-04",
        edd_outcome: "False positive — name similarity only. Non-matching DOB and address history. Confirmed different individual."
      }
    ]
  }
};

const cipResponse = {
  id: "cip-watchlist-cfe73bc1",
  account_id: ACCOUNT_ID,
  created_at: "2025-12-05T11:10:00Z",
  updated_at: "2025-12-07T14:30:00Z",
  provider_name: ["onfido", "jumio"],
  kyc: { id: "kyc-watchlist-cfe73bc1", result: "consider", status: "complete", approval_status: "approved" },
  results: {
    document: { id: "doc-watchlist-cfe73bc1", result: "clear", status: "complete" },
    photo: { id: "photo-watchlist-cfe73bc1", result: "clear", status: "complete" },
    identity: { id: "identity-watchlist-cfe73bc1", result: "clear", status: "complete" },
    watchlist: {
      id: "watchlist-watchlist-cfe73bc1",
      result: "consider",
      status: "complete",
      politically_exposed_person: "consider",
      sanction: "clear",
      adverse_media: "consider",
      monitored_lists: "consider"
    }
  }
};

export default function WatchlistReport() {
  return (
    <ReportPage
      report={{
        title: "Scenario 2 — Watchlist Consider",
        scenario: "Watchlist check returns consider — PEP, adverse media and monitored lists flagged. EDD conducted. All hits confirmed false positives. Account approved.",
        status: "watchlist_consider",
        customer: {
          name: "Priya Arjun Nair",
          email: "priya.nair@example.in",
          phone: "+919876543210",
          dob: "1988-07-22",
          nationality: "Indian (IND)",
          country_of_tax_residence: "UAE",
          tax_id: "784-1988-7654321-2",
          address: "Flat 4B, Marina Towers, Dubai, UAE",
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
