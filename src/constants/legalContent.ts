/** Shared Terms & Conditions / Privacy Policy copy — the single source of
 *  truth read by both the registration screen's consent step and the
 *  read-only viewer in Settings, so the two never drift out of sync. */

export type LegalDocument = 'privacy' | 'terms';

export const LEGAL_VERSION = '1.0';

export const LEGAL_CONTENT: Record<
  LegalDocument,
  { title: string; acceptance: string; sections: Array<{ heading: string; body: string }> }
> = {
  privacy: {
    title: 'Privacy Policy',
    acceptance: 'I have read and agree to the Privacy Policy.',
    sections: [
      {
        heading: 'Information we collect',
        body: 'GreenPlot may collect profile details such as your name, phone number, role and location, along with farm, crop, lease, machinery and work-related information that you choose to provide. We may also collect device and usage information required to operate and improve the app.',
      },
      {
        heading: 'How we use information',
        body: 'We use this information to provide account access, connect farmers and landowners, manage listings and agreements, deliver relevant agricultural features, provide support, prevent misuse and improve our services.',
      },
      {
        heading: 'Sharing and disclosure',
        body: 'Information is shared only when needed to provide a feature, complete a transaction, connect participating users, comply with law or protect users and the service. We do not sell your personal information.',
      },
      {
        heading: 'Permissions and third-party services',
        body: 'Some features may request access to location, camera, microphone, photos or files. Access is used only for the feature you select. The app may rely on service providers for hosting, maps, storage, authentication and analytics, subject to their security and privacy obligations.',
      },
      {
        heading: 'Data security and retention',
        body: 'We use reasonable safeguards to protect information. Data is retained only for as long as necessary to provide the service, meet legal obligations and resolve disputes. No electronic system can be guaranteed to be completely secure.',
      },
      {
        heading: 'Your choices',
        body: 'You may update your profile, manage device permissions, or contact support to request access, correction or deletion of eligible personal information. Certain records may be retained where required by law or legitimate business obligations.',
      },
      {
        heading: 'Policy updates and contact',
        body: 'We may update this policy as the service evolves. Material changes will be communicated through the app or website. For privacy questions or requests, use Help & Support in Settings.',
      },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    acceptance: 'I have read and agree to the Terms & Conditions.',
    sections: [
      {
        heading: 'Acceptance of terms',
        body: 'By accessing or using GreenPlot, you agree to these Terms & Conditions. If you do not agree, you should not use the service.',
      },
      {
        heading: 'Account responsibilities',
        body: 'You must provide accurate information, keep your account secure and promptly update details that change. You are responsible for activity performed through your account and must not impersonate another person.',
      },
      {
        heading: 'Platform services',
        body: 'GreenPlot provides digital tools for agricultural listings, communication, farm management and related services. Unless explicitly stated, GreenPlot is a technology platform and is not a party to agreements made between farmers, owners or service providers.',
      },
      {
        heading: 'User commitments',
        body: 'You agree to use the service lawfully, provide truthful listing and agreement information, respect other users, and avoid fraud, harmful content, unauthorized access or any activity that disrupts the platform.',
      },
      {
        heading: 'Transactions and agreements',
        body: 'Users are responsible for reviewing lease terms, property details, payments and legal documents before accepting them. You should independently verify information and obtain professional advice where appropriate.',
      },
      {
        heading: 'Service availability and liability',
        body: 'We work to keep the service available and accurate, but availability may be interrupted and information may contain errors. To the extent permitted by law, GreenPlot is not liable for indirect losses or disputes arising between users.',
      },
      {
        heading: 'Suspension, changes and contact',
        body: 'Access may be restricted for misuse, security risks or violations of these terms. Features and terms may change over time, with material updates communicated through the app or website. For questions, use Help & Support in Settings.',
      },
    ],
  },
};
