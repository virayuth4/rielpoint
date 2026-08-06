export default function TermsPage() {
  const sections = [
    {
      title: "1. Acceptance of terms",
      body: "By creating an account or using RielPoint, you agree to these Terms and Conditions. If you're accepting on behalf of a business, you confirm you have the authority to do so, and \"you\" refers to that business.",
    },
    {
      title: "2. What RielPoint does",
      body: "RielPoint is loyalty program software for businesses such as coffee shops, restaurants, and hotels. We provide the tools to create, run, and track a loyalty program; we don't set your program's rules, rewards, or terms with your own customers, that's on you.",
    },
    {
      title: "3. Accounts",
      body: "You're responsible for keeping your account credentials secure and for all activity under your account. Tell us right away if you suspect unauthorized access.",
    },
    {
      title: "4. Your loyalty program",
      body: "You control the points, stamps, and rewards you offer through RielPoint, and you're responsible for honoring them with your customers. RielPoint stores and calculates this data on your behalf but is not a party to the loyalty relationship between you and your customers.",
    },
    {
      title: "5. Fees and billing",
      body: "Paid plans are billed in advance on a recurring basis. Fees are non-refundable except where required by law. We'll give you notice before any price change takes effect on your account.",
    },
    {
      title: "6. Acceptable use",
      body: "Don't use RielPoint to break the law, infringe on anyone's rights, send unsolicited marketing, or interfere with the service's normal operation. We can suspend or terminate accounts that violate this.",
    },
    {
      title: "7. Your data",
      body: "You own the customer data you collect through RielPoint. We process it to provide the service and as described in our Privacy Policy, and we don't sell it to third parties.",
    },
    {
      title: "8. Intellectual property",
      body: "RielPoint and its underlying software remain our property. Using the service doesn't transfer any ownership of it to you.",
    },
    {
      title: "9. Termination",
      body: "You can cancel your account at any time. We can suspend or terminate accounts that violate these terms, with notice where reasonably possible.",
    },
    {
      title: "10. Disclaimer and limitation of liability",
      body: "RielPoint is provided \"as is,\" without warranties of any kind. To the extent permitted by law, we're not liable for indirect, incidental, or consequential damages arising from your use of the service.",
    },
    {
      title: "11. Changes to these terms",
      body: "We may update these terms from time to time. If we make material changes, we'll notify you before they take effect. Continued use of RielPoint after that point means you accept the update.",
    },
    {
      title: "12. Contact",
      body: "Questions about these terms can be sent to rielpoint@gmail.com.",
    },
  ];

  return (
    <main className="bg-paper text-ink font-body">
      {/* Nav */}
     
      {/* Title */}
      <section className="mx-auto max-w-4xl px-6 pb-12 pt-8">
        <p className="font-tape text-xs uppercase text-muted-foreground">
          Last updated August 6, 2026
        </p>
        <h1 className="mt-4 font-display text-4xl sm:text-5xl">
          Terms and conditions
        </h1>
        <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          These terms govern your use of RielPoint. Please read them carefully before
          creating an account.
        </p>
      </section>

      {/* Sections */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-4xl divide-y divide-border px-6">
          {sections.map((s) => (
            <div key={s.title} className="py-8">
              <h2 className="font-display text-xl">{s.title}</h2>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer note */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <p className="text-sm text-muted-foreground">
            Have questions?{" "}
            <a href="mailto:rielpoint@gmail.com" className="text-ink underline underline-offset-2">
              rielpoint@gmail.com
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}