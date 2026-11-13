"use client";

import LegalPage from "@/components/common/LegalPage";

export default function TermsOfUsePage() {
  return (
    <LegalPage
      tKey="termsPage"
      sections={["services", "ip", "liability", "contact"]}
      emails={{ contact: "contactEmail" }}
    />
  );
}
