import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { TopNav } from '@/components/TopNav';
import { Footer } from '@/components/Footer';
import { LeadCaptureModal } from '@/components/LeadCaptureModal';
import { Seo, personSchema } from '@/components/Seo';

interface PortfolioItem {
  name: string;
  tag: string;
  blurb: string;
  url?: string;
}

const PORTFOLIO: PortfolioItem[] = [
  {
    name: 'Found',
    tag: 'Personal AI',
    blurb: 'The intelligence layer. Tracks every project, person, and decision across the portfolio so context never gets lost.',
    url: 'https://thefoundai.app',
  },
  {
    name: 'Modus',
    tag: 'Operator AI',
    blurb: 'Engines for SMBs. Productized AI automations sold $2.5k setup + $500/mo. Single-tenant, goal-driven, real KPIs.',
    url: 'https://modus-chi.vercel.app',
  },
  {
    name: 'BiTES',
    tag: 'Food intelligence',
    blurb: 'AI food tracker — plate-photo nutrition, AI coach Lily, restaurant menu scanning. Live on iOS and Android.',
    url: 'https://bites.mycloudmenu.com',
  },
  {
    name: 'HostGPT',
    tag: 'Short-term rental copilot',
    blurb: 'AI host for vacation rentals. Voice + chat + ops, white-labeled per property.',
    url: 'https://myhostgpt.com',
  },
  {
    name: 'PAGE',
    tag: 'Micro-merchant payments',
    blurb: 'Acceptance layer. Stripe Connect Express for micro-merchants who don\'t want a full POS.',
    url: 'https://meetpage.app',
  },
  {
    name: 'Munchies',
    tag: 'Food delivery',
    blurb: 'WhatsApp-first ordering for restaurants. Uber Direct certified.',
    url: 'https://munchies.pr',
  },
];

export function Landing() {
  const [params, setParams] = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (params.get('contact') === '1') {
      setOpen(true);
      params.delete('contact');
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  return (
    <>
      <Seo
        title="Edwin De Leon — DELAI"
        description="Edwin De Leon builds AI-native software. DELAI is the holding company behind Found, Modus, BiTES, HostGPT, and PAGE."
        jsonLd={personSchema()}
      />
      <TopNav />
      <main>
        <Hero onCta={() => setOpen(true)} />
        <Portfolio />
        <Approach />
        <FinalCta onCta={() => setOpen(true)} />
      </main>
      <Footer />
      <LeadCaptureModal open={open} onClose={() => setOpen(false)} source="landing" />
    </>
  );
}

function Hero({ onCta }: { onCta: () => void }) {
  return (
    <section className="mx-auto max-w-6xl px-5 sm:px-8 pt-20 sm:pt-32 pb-24 sm:pb-32">
      <p className="label-mono mb-8">DELAI · DeLeonAI</p>
      <h1 className="font-display text-headline-xl text-ink max-w-4xl">
        I build AI-native software.<br />
        <span className="italic text-ink-muted">One portfolio, one operator.</span>
      </h1>
      <p className="mt-8 text-body-lg text-ink-muted max-w-2xl">
        Edwin De Leon. Founder of DELAI — the holding company behind Found, Modus, BiTES,
        HostGPT, and PAGE. I run the products end-to-end: design, code, ship, support.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <button onClick={onCta} className="btn-primary">Work with me</button>
        <Link to="/intelligence" className="btn-ghost">Read the writing</Link>
      </div>
      <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
        <Stat label="Active products" value="6" />
        <Stat label="In production" value="4" />
        <Stat label="AI agents shipped" value="30+" />
        <Stat label="Based in" value="South Florida" />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-line pt-4">
      <p className="font-display text-2xl text-ink">{value}</p>
      <p className="label-mono mt-1">{label}</p>
    </div>
  );
}

function Portfolio() {
  return (
    <section className="border-t border-line bg-bg-2">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-24 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="label-mono mb-6">The portfolio</p>
            <h2 className="font-display text-headline-lg text-ink">
              Six products,<br />one operator.
            </h2>
            <p className="mt-6 text-body-md text-ink-muted max-w-md">
              Each product is viable standalone. They share intelligence through Found,
              data through Supabase, and infrastructure through the same Mastra agent layer.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {PORTFOLIO.map((p) => (
              <PortfolioCard key={p.name} item={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PortfolioCard({ item }: { item: PortfolioItem }) {
  const Wrapper: any = item.url ? 'a' : 'div';
  const wrapperProps = item.url ? { href: item.url, target: '_blank', rel: 'noreferrer' } : {};
  return (
    <Wrapper
      {...wrapperProps}
      className="block border border-line bg-bg p-6 transition-colors hover:border-ink-muted"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-display text-2xl text-ink">{item.name}</h3>
        <p className="label-mono">{item.tag}</p>
      </div>
      <p className="mt-4 text-sm text-ink-muted leading-relaxed">{item.blurb}</p>
      {item.url ? (
        <p className="mt-6 font-mono text-mono-label text-ink-faint">
          {new URL(item.url).hostname} ↗
        </p>
      ) : null}
    </Wrapper>
  );
}

function Approach() {
  const principles = [
    {
      title: 'Discipline reachable from one place.',
      body: 'Every agent flows through one Mastra registry. Every product writes to one Supabase. Every closeout updates one wiki. The gold-standard library is worthless if a wrapper sits next to it.',
    },
    {
      title: 'Build the sandbox first.',
      body: 'I never gate on Apple entitlements, live API keys, custom domains, or vendor approvals. Mock the integration boundary and ship. The real key arrives after the demo works.',
    },
    {
      title: 'Four PRs, one A-grade.',
      body: 'PR-D for the harness first, then PR-A/B/C for capability. Closed-loop validation. Telemetry from day one. Audits drive the plan, not the other way around.',
    },
    {
      title: 'Y-Elmer audit on every initiative.',
      body: 'Rate it against 7 YC AI-native principles before scoping. If the model is the product\'s only moat, the product is wrong.',
    },
  ];
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-24 sm:py-32">
        <p className="label-mono mb-6">How I work</p>
        <h2 className="font-display text-headline-lg text-ink max-w-2xl">
          Operating principles that survived every product.
        </h2>
        <div className="mt-16 grid gap-12 md:grid-cols-2">
          {principles.map((p) => (
            <div key={p.title}>
              <h3 className="font-display text-xl text-ink">{p.title}</h3>
              <p className="mt-3 text-body-md text-ink-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta({ onCta }: { onCta: () => void }) {
  return (
    <section className="border-t border-line bg-bg-2">
      <div className="mx-auto max-w-3xl px-5 sm:px-8 py-24 sm:py-32 text-center">
        <p className="label-mono mb-6">Work with me</p>
        <h2 className="font-display text-headline-lg text-ink">
          Advisory, fractional CTO,<br />or a full build.
        </h2>
        <p className="mt-6 text-body-md text-ink-muted max-w-xl mx-auto">
          I take a small number of engagements at a time. If you're building an AI-native
          product and want a senior operator who's done it, send a note.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button onClick={onCta} className="btn-primary">Start a conversation</button>
          <a href="mailto:hello@meetdelai.com" className="btn-ghost">hello@meetdelai.com</a>
        </div>
      </div>
    </section>
  );
}
