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
    blurb: 'Intelligence layer for operators. Tracks projects, people, and decisions so context never gets lost between sessions.',
    url: 'https://thefoundai.app',
  },
  {
    name: 'Modus',
    tag: 'Operator AI',
    blurb: 'Productized AI engines for SMBs — goal-driven automations sold as $2.5k setup + $500/mo.',
    url: 'https://modus-chi.vercel.app',
  },
  {
    name: 'BiTES',
    tag: 'Food intelligence',
    blurb: 'AI food tracker live on iOS + Android. Plate-photo nutrition, AI coach, menu scanning.',
    url: 'https://bites.mycloudmenu.com',
  },
  {
    name: 'HostGPT',
    tag: 'STR copilot',
    blurb: 'AI host for short-term rentals. Voice + chat + ops, white-labeled per property.',
    url: 'https://myhostgpt.com',
  },
  {
    name: 'PAGE',
    tag: 'Micro payments',
    blurb: 'Stripe Connect Express acceptance for micro-merchants who don\'t want a full POS.',
    url: 'https://meetpage.app',
  },
  {
    name: 'Munchies',
    tag: 'Food delivery',
    blurb: 'WhatsApp-first restaurant ordering. Uber Direct certified.',
    url: 'https://munchies.pr',
  },
];

const SERVICES = [
  {
    name: 'Advisory',
    tag: 'Recurring sessions',
    body: 'Bring me the hard calls. Architecture choices, build/buy decisions, agent design, hiring. Senior operator perspective from someone in the trenches every day.',
    fit: 'Founders 0→1 on an AI-native product.',
  },
  {
    name: 'Fractional CTO',
    tag: '1–3 month engagement',
    body: 'Embedded with your team to set up the engineering foundation — agent registry, deploy harness, telemetry, validation patterns — so you can ship without me after.',
    fit: 'Seed-stage teams who need senior leadership without the full hire.',
  },
  {
    name: 'Build engagement',
    tag: 'DELAI builds it',
    body: 'I design and build the product end-to-end. You get a working AI-native system, not a slide deck. Handoff when ready, or DELAI keeps running it.',
    fit: 'Operators who know what they need but don\'t have an engineering team.',
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
        title="DELAI — AI consulting that ships"
        description="Elmer De Leon. AI consulting and fractional CTO for founders building AI-native products. Six products in production prove the playbook works."
        jsonLd={personSchema()}
      />
      <TopNav />
      <main>
        <Hero onCta={() => setOpen(true)} />
        <Services onCta={() => setOpen(true)} />
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
        AI consulting<br />
        <span className="italic text-ink-muted">that ships.</span>
      </h1>
      <p className="mt-8 text-body-lg text-ink-muted max-w-2xl">
        I help founders and operators build AI-native products that survive production.
        Advisory, fractional CTO, and full build engagements — backed by a portfolio
        of six AI products I run end-to-end.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <button onClick={onCta} className="btn-primary">Start a conversation</button>
        <Link to="#services" className="btn-ghost">See services</Link>
      </div>
      <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
        <Stat label="Products in production" value="6" />
        <Stat label="AI agents shipped" value="30+" />
        <Stat label="Years building" value="10+" />
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

function Services({ onCta }: { onCta: () => void }) {
  return (
    <section id="services" className="border-t border-line bg-bg-2">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-24 sm:py-32">
        <p className="label-mono mb-6">Engagements</p>
        <h2 className="font-display text-headline-lg text-ink max-w-2xl">
          Three ways to work together.
        </h2>
        <p className="mt-6 text-body-md text-ink-muted max-w-2xl">
          Pricing happens in conversation — every engagement scopes to your problem,
          your team, and your timeline. I take a small number at a time.
        </p>
        <div className="mt-16 grid gap-px bg-line">
          {SERVICES.map((s) => (
            <div key={s.name} className="bg-bg-2 p-8 grid gap-4 md:grid-cols-[1fr_2fr]">
              <div>
                <h3 className="font-display text-2xl text-ink">{s.name}</h3>
                <p className="label-mono mt-2">{s.tag}</p>
              </div>
              <div>
                <p className="text-body-md text-ink-muted">{s.body}</p>
                <p className="mt-4 font-mono text-mono-label text-ink-faint">
                  Best fit: {s.fit}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12">
          <button onClick={onCta} className="btn-primary">Tell me what you're building</button>
        </div>
      </div>
    </section>
  );
}

function Portfolio() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-24 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="label-mono mb-6">Proof, not slides</p>
            <h2 className="font-display text-headline-lg text-ink">
              Six AI products,<br />all in production.
            </h2>
            <p className="mt-6 text-body-md text-ink-muted max-w-md">
              I don't teach AI in theory — I ship it. Every product in the DELAI
              portfolio is live, paying for itself, and built on the same agent
              architecture I bring to client work.
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
      body: 'Every agent flows through one registry. Every product writes to one database. The gold-standard library is worthless if a wrapper sits next to it — and that\'s the first thing I audit when I walk in.',
    },
    {
      title: 'Ship the sandbox first.',
      body: 'I never gate on Apple entitlements, live API keys, custom domains, or vendor approvals. Mock the integration boundary and ship a working demo. The real keys arrive after the demo works.',
    },
    {
      title: 'Four PRs, one A-grade.',
      body: 'PR-D for the harness first, then PR-A/B/C for capability. Closed-loop validation. Telemetry from day one. Audits drive the plan, not the other way around — I learned this shipping production AI, not reading about it.',
    },
    {
      title: 'AI-native or nothing.',
      body: 'If the model is the product\'s only moat, the product is wrong. I rate every initiative against seven YC AI-native principles before scoping work — and tell you honestly which products don\'t need an AI build at all.',
    },
  ];
  return (
    <section className="border-t border-line bg-bg-2">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-24 sm:py-32">
        <p className="label-mono mb-6">How I work</p>
        <h2 className="font-display text-headline-lg text-ink max-w-2xl">
          What you get when you work with me.
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
    <section className="border-t border-line">
      <div className="mx-auto max-w-3xl px-5 sm:px-8 py-24 sm:py-32 text-center">
        <p className="label-mono mb-6">Let's talk</p>
        <h2 className="font-display text-headline-lg text-ink">
          You bring the problem.<br />
          I'll bring the playbook.
        </h2>
        <p className="mt-6 text-body-md text-ink-muted max-w-xl mx-auto">
          One reply, real answer. No drip sequences, no discovery deck, no
          "let me circle back with the team." It's just me.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button onClick={onCta} className="btn-primary">Start a conversation</button>
          <a href="mailto:hello@meetdelai.com" className="btn-ghost">hello@meetdelai.com</a>
        </div>
      </div>
    </section>
  );
}
