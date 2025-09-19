import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#2DD4BF] via-[#EC4899] to-[#2DD4BF] bg-clip-text text-transparent mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-400">Last updated: [Date]</p>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          <section className="bg-[#111111]/90 rounded-lg p-8 border border-[#2DD4BF]/20">
            <h2 className="text-2xl font-bold text-[#2DD4BF] mb-4">Introduction</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                Welcome to the Scavenjer Privacy Policy. This Privacy Policy ("Policy") explains how Scavenjer ("we", "us", or "our") collects, uses, stores, and shares information about you ("user" or "you") when you use our global scavenger hunt platform and related services (collectively, the "Service").
              </p>
              <p>
                We are committed to protecting your privacy and handling your personal data in an open and transparent manner. By using Scavenjer, you agree to the collection and use of information in accordance with this Policy. If you do not agree with our practices, please do not use the Service.
              </p>
              <p>
                This Policy is incorporated into our Terms and Conditions, and terms defined in the Terms have the same meaning here. We encourage you to read this Policy carefully to understand our practices.
              </p>

              <p className="font-bold text-white pt-2">Scope</p>
              <p>
                This Policy applies to all users of Scavenjer worldwide. We aim to comply with major privacy regulations, including the EU General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA), as well as other applicable laws. Specific rights for users under those laws are described in Section 8 below. Additional privacy notices may apply if we launch region-specific features or if required by local law, but unless otherwise noted, this Policy is intended to cover our data practices globally.
              </p>
              
              <p className="font-bold text-white pt-2">Third-Party Services</p>
              <p>
                Please note that Scavenjer works closely with certain third parties (such as Marbleverse and Supabase) to provide our Service. While this Policy focuses on how we handle your data, there are instances where your data may be shared with or collected by third-party services in the course of using Scavenjer (e.g., when claiming a reward through Marbleverse).
              </p>
              <p>
                We include information about those relationships in this Policy. However, we do not control third-party privacy practices, and we encourage you to review the privacy policies of any third-party service you interact with through Scavenjer. For example:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  <a href="https://app.marblever.se" target="_blank" rel="noopener noreferrer" className="text-[#2DD4BF] hover:underline">Marbleverse Privacy Policy</a>
                </li>
                <li>
                  <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#2DD4BF] hover:underline">Supabase Privacy Policy</a>
                </li>
              </ul>
              <p>
                By using Scavenjer, you consent to the data practices described in this Policy. If you have any questions or concerns, please contact us using the information provided at the end of this Policy.
              </p>
            </div>
          </section>

          <section className="bg-[#111111]/90 rounded-lg p-8 border border-[#2DD4BF]/20">
            <h2 className="text-2xl font-bold text-[#2DD4BF] mb-4">Information We Collect</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                We collect personal information that you provide to us directly, information generated from your use of the Service, and some information from third parties or public sources. We strive to minimize the data we collect to only what is necessary for the purposes set out in this Policy. The types of information we collect are:
              </p>

              <h3 className="text-xl font-bold text-white pt-4">2.1 Information You Provide to Us</h3>
              <p>You may choose to give us certain information when using Scavenjer, including:</p>
              <ul className="list-disc list-inside space-y-3 pl-4">
                <li>
                  <strong className="font-semibold text-white">Contact Information:</strong> When you create an account or communicate with us, you may provide personal identifiers such as your name (optional), email address, and/or username. We require an email address during registration for account verification, login, and communication purposes.
                </li>
                <li>
                  <strong className="font-semibold text-white">Digital Wallet Address:</strong> Since Scavenjer rewards involve digital assets, we collect your cryptocurrency or digital wallet address (e.g., an Ethereum address) to facilitate reward distribution. You might provide this during account setup or before claiming a reward.
                </li>
                <li>
                  <strong className="font-semibold text-white">Location Information (User-Submitted):</strong> Precise, continuous location tracking is not collected. However, Scavenjer may occasionally collect general location data that you explicitly provide, for example, to suggest a scavenger hunt "drop" in your area. This is voluntary and not collected in the background.
                </li>
                <li>
                  <strong className="font-semibold text-white">Communications and Support:</strong> If you contact us directly (via email, support ticket, or social media), we will receive the information you provide in that communication.
                </li>
                <li>
                  <strong className="font-semibold text-white">Profile Information (Optional):</strong> We may allow optional profile details like a display name or profile photo. Providing such info is up to you and is generally public to other users.
                </li>
                <li>
                  <strong className="font-semibold text-white">Other Data You Choose to Give Us:</strong> This could include responses to surveys, feedback forms, or entries to contests.
                </li>
              </ul>
              <p className="pl-4 pt-2 text-sm text-gray-400">
                <strong className="font-bold">Note:</strong> We do NOT ask for or process sensitive personal information such as Social Security numbers, government ID numbers, financial account passwords, or precise biometric data.
              </p>

              <h3 className="text-xl font-bold text-white pt-4">2.2 Information We Collect Automatically</h3>
              <p>When you use Scavenjer, certain data gets collected automatically about your device and how you interact with the Service. This includes:</p>
              <ul className="list-disc list-inside space-y-3 pl-4">
                <li>
                  <strong className="font-semibold text-white">Usage and Log Data:</strong> Our systems automatically record your IP address, device and browser type, pages viewed, and actions taken to monitor usage and secure the Service.
                </li>
                <li>
                  <strong className="font-semibold text-white">Cookies and Similar Technologies:</strong> We use cookies to remember your preferences, maintain your login session, and gather usage analytics. We do not use them for advertising.
                </li>
                <li>
                  <strong className="font-semibold text-white">Device Sensors (for AR):</strong> With your permission, AR features may use your device's camera and motion sensors. This data is processed in real-time and is not stored by us.
                </li>
                <li>
                  <strong className="font-semibold text-white">Crash and Diagnostic Data:</strong> If the app or site crashes, we may receive a report with technical details to help us debug and improve stability.
                </li>
              </ul>
              <p className="pl-4 pt-2">
                We do not use automated decision-making or profiling that produces legal effects or similarly significant effects on you, without human involvement.
              </p>

              <h3 className="text-xl font-bold text-white pt-4">2.3 Information from Third Parties</h3>
              <p>We may obtain information about you from third-party sources in a few scenarios:</p>
              <ul className="list-disc list-inside space-y-3 pl-4">
                <li>
                  <strong className="font-semibold text-white">Third-Party Login:</strong> If you sign in via a third-party account (e.g., Google), we receive information from that service to authenticate you.
                </li>
                <li>
                  <strong className="font-semibold text-white">Payment Processors:</strong> When we implement purchases, we may receive payment confirmation from our processor, but not your full credit card information.
                </li>
                <li>
                  <strong className="font-semibold text-white">Marbleverse Data:</strong> To facilitate our integration, Marbleverse might share data like reward claim confirmations or event statistics. We only receive what is necessary to coordinate the Service.
                </li>
                <li>
                  <strong className="font-semibold text-white">Publicly Available Sources:</strong> We generally do not collect data from public databases, but may use them for fraud prevention or legal compliance.
                </li>
              </ul>
              <p className="pl-4 pt-2">
                We will combine information from these third-party sources with the information we collect directly where necessary and will treat all such combined information under this Policy.
              </p>
            </div>
          </section>

          <section className="bg-[#111111]/90 rounded-lg p-8 border border-[#2DD4BF]/20">
            <h2 className="text-2xl font-bold text-[#2DD4BF] mb-4">How We Use Your Information</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                We use the collected information for various purposes consistent with providing and improving the Scavenjer Service. The primary purposes for which we process your personal data include:
              </p>
              <ul className="list-disc list-inside space-y-3 pl-4">
                <li>
                  <strong className="font-semibold text-white">To Provide and Maintain the Service:</strong> We use your information to operate Scavenjer's core functionality, like authenticating users, delivering rewards, and saving your progress.
                </li>
                <li>
                  <strong className="font-semibold text-white">To Communicate with You:</strong> We use your contact information to send Service-related communications, such as registration confirmations, reward notices, and important updates. You can opt out of non-essential emails.
                </li>
                <li>
                  <strong className="font-semibold text-white">Rewards and User Engagement:</strong> We process data to manage our rewards program, including verifying eligibility, contacting winners, and delivering prizes.
                </li>
                <li>
                  <strong className="font-semibold text-white">Customer Support:</strong> We use your information to investigate and respond to your support requests and to improve our support process.
                </li>
                <li>
                  <strong className="font-semibold text-white">Improvement and Development:</strong> We analyze aggregated and anonymized data to understand how users interact with our Service, helping us to improve features and overall user experience.
                </li>
                <li>
                  <strong className="font-semibold text-white">Marketing and Outreach:</strong> With your consent, we may send you newsletters or other promotional materials. We do not sell your personal information to third-party advertisers.
                </li>
                <li>
                  <strong className="font-semibold text-white">Security and Fraud Prevention:</strong> We use data to monitor for and prevent fraudulent or suspicious activity and to enforce our Terms of Service.
                </li>
                <li>
                  <strong className="font-semibold text-white">Legal Obligations:</strong> We may process your data to comply with legal or regulatory requirements, such as responding to lawful requests from public authorities.
                </li>
                <li>
                  <strong className="font-semibold text-white">Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your data may be transferred as part of the transaction. We will notify you of any such change.
                </li>
              </ul>
              <p className="pl-4 pt-2">
                We will only process your personal information where we have a valid legal basis. If we need to use your information for a purpose materially different from those listed, we will update this Policy or seek your consent.
              </p>
            </div>
          </section>

          <section className="bg-[#111111]/90 rounded-lg p-8 border border-[#2DD4BF]/20">
            <h2 className="text-2xl font-bold text-[#2DD4BF] mb-4">How We Share or Disclose Information</h2>
            <div className="space-y-4 text-gray-300">
              <p>We understand that your personal information is important, and we are not in the business of selling it to others. We share information about you only in the limited circumstances described below, and with safeguards in place, either as necessary to provide our Service or as required by law.</p>
              
              <h3 className="text-xl font-bold text-white pt-4">4.1 Service Providers (Processors)</h3>
              <p>We share personal data with service providers that perform functions on our behalf to support the Service. These providers are contractually obligated to process your data only as instructed by us and to provide appropriate security measures. Key service providers include:</p>
              <ul className="list-disc list-inside space-y-3 pl-4">
                  <li>
                    <strong className="font-semibold text-white">Supabase:</strong> As our cloud backend provider, Supabase hosts our databases and authentication system, storing your personal data on their servers under our instruction.
                  </li>
                  <li>
                    <strong className="font-semibold text-white">Email and Communication Tools:</strong> We may use third-party email services to send verification emails, notifications, and newsletters.
                  </li>
                  <li>
                    <strong className="font-semibold text-white">Payment Processor:</strong> When we introduce payments, a third-party processor will handle transactions. We do not see or store your full credit card information.
                  </li>
                  <li>
                    <strong className="font-semibold text-white">Analytics Services:</strong> We may use third-party analytics tools to understand usage of our Service. This data is aggregated and does not personally identify you.
                  </li>
                  <li>
                    <strong className="font-semibold text-white">Cloud and IT Providers:</strong> We might use other cloud services, such as a Content Delivery Network (CDN) or cloud storage for files, from reputable and secure providers.
                  </li>
              </ul>
              <p>Each of our service providers has been evaluated for their privacy and security practices, and we have contracts in place to ensure your data is protected.</p>

              <h3 className="text-xl font-bold text-white pt-4">4.2 Third-Party Platforms Integral to the Service</h3>
              <p>
                In some cases, third-party platforms are core parts of your interaction with Scavenjer. The main example is <a href="https://app.marblever.se" target="_blank" rel="noopener noreferrer" className="text-[#2DD4BF] hover:underline">Marbleverse</a>. When you participate in AR scavenger hunts or claim digital rewards, you may be using the Marbleverse platform. In these cases, Marbleverse is collecting data under its own privacy policy. We encourage you to review it.
              </p>

              <h3 className="text-xl font-bold text-white pt-4">4.3 Legal Compliance and Protection</h3>
              <p>
                We may disclose your information if required to do so by law or in the good-faith belief that such action is necessary to comply with legal obligations, protect and enforce our rights, prevent harm, or address fraud and security issues.
              </p>

              <h3 className="text-xl font-bold text-white pt-4">4.4 Business Transfers</h3>
              <p>
                If Scavenjer or its parent company undergoes a business transaction such as a merger, acquisition, or sale of assets, your personal data may be among the assets transferred. We will notify users of any such change in control and any choices you may have regarding your personal information.
              </p>

              <h3 className="text-xl font-bold text-white pt-4">4.5 With Your Consent</h3>
              <p>
                Apart from the situations above, we will seek your consent before sharing your personal information with third parties in any other scenario. For example, if we want to post a user testimonial or a partner company wants to offer you a promotion.
              </p>
            </div>
          </section>

          <section className="bg-[#111111]/90 rounded-lg p-8 border border-[#2DD4BF]/20">
            <h2 className="text-2xl font-bold text-[#2DD4BF] mb-4">Cookies and Tracking Technologies</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                As noted in Section 2.2, we use cookies and similar tracking technologies. Here is more detail about what they are and the choices you have:
              </p>
              <ul className="list-disc list-inside space-y-3 pl-4">
                <li>
                  <strong className="font-semibold text-white">Essential Cookies:</strong> These are necessary for the Service to function, such as keeping you logged in.
                </li>
                <li>
                  <strong className="font-semibold text-white">Preference Cookies:</strong> These remember your settings, like a language preference.
                </li>
                <li>
                  <strong className="font-semibold text-white">Analytics Cookies:</strong> These help us understand site traffic and usage patterns. The data is aggregated and does not personally identify you.
                </li>
                <li>
                  <strong className="font-semibold text-white">Web Beacons and Pixels:</strong> These are small electronic files that help us measure the effectiveness of email campaigns by letting us know if an email was opened.
                </li>
              </ul>
              
              <h3 className="text-xl font-bold text-white pt-4">Your Choices</h3>
              <ul className="list-disc list-inside space-y-3 pl-4">
                <li>
                  <strong className="font-semibold text-white">Browser Settings:</strong> You can set your web browser to refuse or delete cookies. Note that if you block all cookies, some parts of Scavenjer might not work.
                </li>
                <li>
                  <strong className="font-semibold text-white">Analytics Opt-Out:</strong> For Google Analytics, you can install their opt-out browser add-on.
                </li>
                <li>
                  <strong className="font-semibold text-white">Do Not Track:</strong> We treat "Do Not Track" (DNT) signals seriously and will attempt to ensure any third-party scripts we use respect them.
                </li>
                <li>
                  <strong className="font-semibold text-white">Mobile:</strong> On mobile devices, you can usually control tracking via your device's privacy settings.
                </li>
              </ul>
              <p className="pl-4 pt-2">
                We are transparent about our use of cookies. They are primarily used to make the Service smoother and to help us understand its usage.
              </p>
            </div>
          </section>

          <section className="bg-[#111111]/90 rounded-lg p-8 border border-[#2DD4BF]/20">
            <h2 className="text-2xl font-bold text-[#2DD4BF] mb-4">Data Security</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                We take security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.
              </p>
              <p className="font-bold text-white pt-2">Security Measures Implemented:</p>
              <ul className="list-disc list-inside space-y-3 pl-4">
                <li>
                  <strong className="font-semibold text-white">Encryption:</strong> All communications are protected using TLS/SSL (HTTPS), and data is encrypted at rest.
                </li>
                <li>
                  <strong className="font-semibold text-white">Authentication Protection:</strong> Passwords are hashed and salted, and we may implement measures like login attempt throttling.
                </li>
                <li>
                  <strong className="font-semibold text-white">Access Controls:</strong> We restrict access to personal information to authorized personnel who need it to perform their duties.
                </li>
                <li>
                  <strong className="font-semibold text-white">Testing and Maintenance:</strong> We keep our software up to date and utilize security features provided by our hosting environment.
                </li>
                <li>
                  <strong className="font-semibold text-white">Payment Info:</strong> We do not store credit card details on our servers. Transactions are handled by PCI-compliant third-party processors.
                </li>
                <li>
                  <strong className="font-semibold text-white">Backups:</strong> We perform regular encrypted backups of critical data to prevent loss.
                </li>
              </ul>
              <p className="pl-4 pt-2">
                Despite these measures, absolute security cannot be guaranteed. You also play a role in protecting your account credentials. In the event of a data breach, we will act promptly to mitigate the damage and notify affected users as required by law.
              </p>
            </div>
          </section>

          <section className="bg-[#111111]/90 rounded-lg p-8 border border-[#2DD4BF]/20">
            <h2 className="text-2xl font-bold text-[#2DD4BF] mb-4">Data Retention</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                We will retain your personal information for as long as it is necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Here's how we approach retention:
              </p>
              <ul className="list-disc list-inside space-y-3 pl-4">
                <li>
                  <strong className="font-semibold text-white">Active Account Data:</strong> We keep your account information for as long as your account is active to ensure you can use the Service.
                </li>
                <li>
                  <strong className="font-semibold text-white">Inactive Accounts:</strong> If you stop using Scavenjer, we may retain your data for a reasonable period (e.g., 1-2 years) before deleting or anonymizing it.
                </li>
                <li>
                  <strong className="font-semibold text-white">Reward Records:</strong> Records of rewards distributed may be kept in an anonymized or aggregated form for auditing and anti-fraud purposes.
                </li>
                <li>
                  <strong className="font-semibold text-white">Communications:</strong> We may retain support communications for a few years to maintain a history of your interactions.
                </li>
                <li>
                  <strong className="font-semibold text-white">Legal and Compliance:</strong> We may retain certain information for longer if necessary to comply with legal obligations or resolve disputes.
                </li>
                <li>
                  <strong className="font-semibold text-white">Backup Systems:</strong> Deleted data may persist for a time in our encrypted backup systems until they are cycled out.
                </li>
              </ul>
              <p className="pl-4 pt-2">
                When we no longer have a legitimate need to keep your personal data, we will either delete or anonymize it. You have the right to request deletion, and we will honor it unless we are required to keep certain data.
              </p>
            </div>
          </section>

          <section className="bg-[#111111]/90 rounded-lg p-8 border border-[#2DD4BF]/20">
            <h2 className="text-2xl font-bold text-[#2DD4BF] mb-4">Your Rights and Choices</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                Depending on where you live, you have certain rights regarding your personal information. Scavenjer is committed to honoring those rights.
              </p>

              <h3 className="text-xl font-bold text-white pt-4">8.1 General Privacy Rights (For All Users)</h3>
              <p>Regardless of jurisdiction, we strive to provide the following controls over your information:</p>
              <ul className="list-disc list-inside space-y-3 pl-4">
                <li>
                  <strong className="font-semibold text-white">Access and Portability:</strong> You have the right to request a copy of the personal data we hold about you in a structured, electronic format.
                </li>
                <li>
                  <strong className="font-semibold text-white">Rectification (Correction):</strong> If any personal information we have is inaccurate or incomplete, you have the right to ask us to correct it.
                </li>
                <li>
                  <strong className="font-semibold text-white">Deletion:</strong> You can request the deletion of your personal data. We will erase your data, except for information we are required or permitted to retain.
                </li>
                <li>
                  <strong className="font-semibold text-white">Withdrawal of Consent:</strong> Where we rely on your consent to process data, you have the right to withdraw that consent at any time.
                </li>
                <li>
                  <strong className="font-semibold text-white">Objection to Processing:</strong> You have the right to object to our processing of your data based on legitimate interests if you feel it impacts your fundamental rights.
                </li>
                <li>
                  <strong className="font-semibold text-white">Restriction of Processing:</strong> You can ask us to pause the processing of your personal data in certain circumstances, such as if you contest its accuracy.
                </li>
                <li>
                  <strong className="font-semibold text-white">Non-Discrimination:</strong> We will not discriminate against you for exercising any of these rights.
                </li>
              </ul>
              <p className="pl-4 pt-2">
                To exercise any of these rights, please contact us. We may need to verify your identity and will respond within a reasonable timeframe.
              </p>

              <h3 className="text-xl font-bold text-white pt-4">8.2 Rights for EEA/UK Individuals (GDPR Specific)</h3>
              <p>If you are in the European Economic Area or the UK, you have the rights outlined above, plus some additional context:</p>
              <ul className="list-disc list-inside space-y-3 pl-4">
                <li>
                  <strong className="font-semibold text-white">Legal Basis for Processing:</strong> You have the right to know the legal bases on which we process your data (e.g., your consent, performance of a contract, legitimate interests).
                </li>
                <li>
                  <strong className="font-semibold text-white">Data Portability:</strong> You have the right to receive your data in a format that can be transferred to another service.
                </li>
                <li>
                  <strong className="font-semibold text-white">Right to Object to Direct Marketing:</strong> You can object at any time to our use of your data for direct marketing, and we will stop immediately.
                </li>
                <li>
                  <strong className="font-semibold text-white">Right to Lodge a Complaint:</strong> You have the right to lodge a complaint with a supervisory data protection authority in your country.
                </li>
              </ul>

              <h3 className="text-xl font-bold text-white pt-4">8.3 Rights for California Residents (CCPA/CPRA)</h3>
              <p>If you are a resident of California, you have specific rights under the CCPA/CPRA, including:</p>
              <ul className="list-disc list-inside space-y-3 pl-4">
                <li>
                  <strong className="font-semibold text-white">Right to Know:</strong> You can request that we disclose the categories and specific pieces of personal information we have collected about you.
                </li>
                <li>
                  <strong className="font-semibold text-white">Right to Delete:</strong> You can request the deletion of your personal information, subject to certain exceptions.
                </li>
                <li>
                  <strong className="font-semibold text-white">Right to Correct:</strong> You have the right to request that we correct inaccurate personal information we maintain about you.
                </li>
                <li>
                  <strong className="font-semibold text-white">Right to Opt-Out of Sale/Sharing:</strong> We do not sell or share your personal information for cross-context behavioral advertising, so there is nothing to opt out of.
                </li>
                <li>
                  <strong className="font-semibold text-white">Right to Limit Use of Sensitive PI:</strong> We do not collect sensitive personal information, so this right is not applicable.
                </li>
                <li>
                  <strong className="font-semibold text-white">Non-Discrimination:</strong> We will not discriminate against you for exercising your CCPA rights.
                </li>
              </ul>
              <p className="pl-4 pt-2">
                California residents can submit requests through our contact methods. We will need to verify your identity to process your request.
              </p>

              <h3 className="text-xl font-bold text-white pt-4">8.4 Other Region-Specific Rights</h3>
              <p>
                Users in other jurisdictions (e.g., Canada, Australia, Brazil) may have similar rights under local laws. We strive to honor all such requests in line with applicable regulations.
              </p>
            </div>
          </section>

          <section className="bg-[#111111]/90 rounded-lg p-8 border border-[#2DD4BF]/20">
            <h2 className="text-2xl font-bold text-[#2DD4BF] mb-4">Children's Privacy</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                Our Service is not directed to individuals under the age of 13 (or a higher age as required by local law). <strong className="font-semibold text-white">We do not knowingly collect personal information from children.</strong>
              </p>
              <p>
                If we become aware that we have collected personal data from a child without parental consent, we will take steps to remove that information. If you are a parent or guardian and believe your child has provided us with personal data, please contact us.
              </p>
            </div>
          </section>

          <section className="bg-[#111111]/90 rounded-lg p-8 border border-[#2DD4BF]/20">
            <h2 className="text-2xl font-bold text-[#2DD4BF] mb-4">International Data Transfers</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                Scavenjer operates globally, which means your personal information may be transferred to, and processed in, countries other than the one you reside in. These countries may have data protection laws that are different from the laws of your country.
              </p>
              <p>
                Specifically, our servers are located in the United States, and our third-party service providers may operate in various countries. <strong className="font-semibold text-white">We take appropriate safeguards to protect your information</strong>, such as using Standard Contractual Clauses for transfers of data from the European Economic Area.
              </p>
            </div>
          </section>
          
          <section className="bg-[#111111]/90 rounded-lg p-8 border border-[#2DD4BF]/20">
            <h2 className="text-2xl font-bold text-[#2DD4BF] mb-4">Changes to This Privacy Policy</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
              <p>
                <strong className="font-semibold text-white">We encourage you to review this Privacy Policy periodically for any changes.</strong> Changes to this Privacy Policy are effective when they are posted on this page. For significant changes, we may also provide a more prominent notice, such as through an in-app notification or by email.
              </p>
            </div>
          </section>

          <section className="bg-[#111111]/90 rounded-lg p-8 border border-[#2DD4BF]/20">
            <h2 className="text-2xl font-bold text-[#2DD4BF] mb-4">Contact Us</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                If you have any questions about this Privacy Policy, please contact us.
              </p>
              <p>
                You can reach us by email at: <a href="mailto:support@scavenjer.com" className="text-[#2DD4BF] hover:underline">support@scavenjer.com</a>
              </p>
              <p>
                We will do our best to address your inquiries in a timely and satisfactory manner.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}