import Link from "next/link";

export default function AboutPage() {
  const points = [
    {
      title: "Retention, not just rewards",
      body: "A points balance doesn't bring anyone back. We focus on the habit — the reason a customer chooses you the second, third, and tenth time.",
    },
    {
      title: "One system, every location type",
      body: "Coffee shop, restaurant, or hotel — the mechanics of a return visit are the same. RielPoint runs all of them from one dashboard.",
    },
    {
      title: "Built for small teams",
      body: "No loyalty manager on staff, no engineering team. If you can run a till, you can run RielPoint.",
    },
  ];

  return (
    <main className="bg-paper text-ink font-body">
      {/* Nav */}
     

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pb-16 pt-8">
        <p className="font-tape text-xs uppercase text-muted-foreground">
          Our goal
        </p>
        <h1 className="mt-4 max-w-2xl font-display text-4xl sm:text-5xl">
          Help businesses keep the customers they already have.
        </h1>
        <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Winning a new customer costs more than keeping one. RielPoint exists to make
          the second visit, and the tenth, easy to earn. We&apos;re a simple loyalty program for
          coffee shops, restaurants, hotels, and anywhere else people should want to
          come back.
        </p>
      </section>

      {/* Points */}
      <section className="border-t border-border">
        <div className="mx-auto grid max-w-4xl gap-10 px-6 py-16 sm:grid-cols-3">
          {points.map((p) => (
            <div key={p.title}>
              <h3 className="font-display text-lg">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="mx-auto flex max-w-4xl flex-col items-start justify-between gap-6 px-6 py-16 sm:flex-row sm:items-center">
          <h2 className="max-w-sm font-display text-2xl">
            Turn one-time visitors into regulars.
          </h2>
          <Link
            href="/#get-started"
            className="press rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper shadow-sm"
          >
            Get started
          </Link>
        </div>
      </section>
    </main>
  );
}