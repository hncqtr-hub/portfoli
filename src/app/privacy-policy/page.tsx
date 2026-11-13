"use client";

import LegalPage from "@/components/common/LegalPage";

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      tKey="privacyPage"
      sections={["collect", "use", "protect", "rights", "contact"]}
      emails={{ rights: "rightsEmail", contact: "contactEmail" }}
    />
  );
}
