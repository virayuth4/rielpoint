export default function TermsPage() {
  const sections = [
    {
      title: "1. Acceptance of terms",
      body: "By creating an account or using RielPoint, you agree to these Terms and Conditions. If you're accepting on behalf of a business, you confirm you have the authority to do so, and \"you\" refers to that business.",
    },
    {
      title: "2. What RielPoint does",
      body: "RielPoint is a cashback platform for shoppers in Cambodia. When you click through RielPoint to a partner store and make a qualifying purchase, we earn a commission from that store and share part of it with you as cashback. We are not the seller of any product or service you buy through a partner store, and we're not a party to that purchase.",
    },
    {
      title: "3. Accounts",
      body: "You must create an account to earn and withdraw cashback. You're responsible for keeping your account credentials secure and for all activity under your account. Tell us right away if you suspect unauthorized access. One account per person; duplicate or fraudulent accounts may be closed and any cashback in them forfeited.",
    },
    {
      title: "4. How cashback works",
      body: "Cashback is only earned when your purchase is correctly tracked, which depends on things outside our control, such as your browser, ad blockers, cookies, and the partner store's own tracking. Cashback usually starts as \"pending\" and is only confirmed once the partner store validates the sale and confirms it hasn't been cancelled, returned, or refunded. Tracking or timing issues can happen, and we're not liable if a purchase fails to track. Confirmed cashback rates, minimum purchase amounts, and any exclusions are shown for each store or offer and may change at any time.",
    },
    {
      title: "5. Withdrawals and payouts",
      body: "You can withdraw confirmed cashback once it reaches the minimum payout threshold shown in your account, using the withdrawal methods we offer. We may run identity checks before releasing a payout. We're not responsible for delays caused by your bank, e-wallet provider, or incorrect payout details you've provided.",
    },
    {
      title: "6. Referrals and promotions",
      body: "We may offer referral bonuses or promotional cashback from time to time. These are subject to their own specific terms, which we'll display alongside the offer, and we can end or change a promotion at any time.",
    },
    {
      title: "7. Acceptable use",
      body: "Don't use RielPoint to break the law, submit false or self-dealing purchases, manipulate tracking links, create multiple accounts to abuse promotions, or interfere with the service's normal operation. We can withhold cashback, suspend, or terminate accounts that violate this.",
    },
    {
      title: "8. Your data",
      body: "We collect and process your personal data to run your account, track your purchases, and pay out cashback, as described in our Privacy Policy. We don't sell your personal data to third parties.",
    },
    {
      title: "9. Intellectual property",
      body: "RielPoint and its underlying software remain our property. Using the service doesn't transfer any ownership of it to you.",
    },
    {
      title: "10. Termination",
      body: "You can close your account at any time. We can suspend or terminate accounts that violate these terms, with notice where reasonably possible. Any pending cashback tied to fraudulent or abusive activity may be forfeited.",
    },
    {
      title: "11. Disclaimer and limitation of liability",
      body: "RielPoint is provided \"as is,\" without warranties of any kind. We don't control partner stores' prices, stock, or service, and we're not responsible for issues with the products or services you buy through them. To the extent permitted by law, we're not liable for indirect, incidental, or consequential damages arising from your use of the service.",
    },
    {
      title: "12. Changes to these terms",
      body: "We may update these terms from time to time. If we make material changes, we'll notify you before they take effect. Continued use of RielPoint after that point means you accept the update.",
    },
    {
      title: "13. Contact",
      body: "Questions about these terms can be sent to rielpoint@gmail.com.",
    },
  ];

  return (
    <main className="bg-paper text-ink font-body">
      {/* Nav */}

      {/* Title */}
      <section className="mx-auto max-w-4xl px-6 pb-12 pt-8">
        <p className="font-tape text-xs uppercase text-muted-foreground">
          Last updated August 13, 2026
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