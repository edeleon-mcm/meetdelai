import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TopNav } from '@/components/TopNav';
import { Footer } from '@/components/Footer';
import { LeadCaptureModal } from '@/components/LeadCaptureModal';
import { Seo, personSchema } from '@/components/Seo';

const CAPABILITIES = [
  {
    name: 'AI Assistants',
    body: 'Voice, chat, and operational AI systems designed around real customer interactions and internal workflows.',
  },
  {
    name: 'Operational Automation',
    body: 'Workflow engines that connect fragmented systems, automate repetitive tasks, and reduce operational drag.',
  },
  {
    name: 'Customer Experience Systems',
    body: 'Ordering, payments, communication, and service flows designed for modern customer expectations.',
  },
  {
    name: 'Internal Intelligence',
    body: 'Knowledge systems that help businesses organize information, preserve context, and operate more intelligently over time.',
  },
];

const OPERATING_PRINCIPLES = [
  'Observability from day one',
  'Human approval loops where needed',
  'Workflow reliability over AI hype',
  'Fast iteration cycles',
  'Real operational deployment',
  'Long-term maintainability',
];

const NATIVE_DIMENSIONS = [
  'Speed',
  'Automation',
  'Operational visibility',
  'Intelligent workflows',
  'Lower friction',
  'Better customer experiences',
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
        title="DELAI — Operational AI for real businesses"
        description="DELAI builds operational AI systems for restaurants, hospitality, service businesses, and local commerce."
        jsonLd={personSchema()}
      />
      <TopNav />
      <main>
        <Hero onCta={() => setOpen(true)} />
        <Operators />
        <Capabilities />
        <Operations />
        <NativeNotDecorated />
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
      <p className="label-mono mb-8">DELAI</p>
      <h1 className="font-display text-headline-xl text-ink max-w-4xl">
        Operational AI<br />
        <span className="italic text-ink-muted">for real businesses.</span>
      </h1>
      <p className="mt-8 text-body-lg text-ink-muted max-w-3xl">
        The next generation of business software will not be dashboards and manual workflows.
        It will be systems that observe, respond, automate, and operate alongside the business
        in real time.
      </p>
      <p className="mt-4 text-body-lg text-ink max-w-3xl">
        DELAI builds those systems.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <button onClick={onCta} className="btn-primary">Start a conversation</button>
      </div>
    </section>
  );
}

function Operators() {
  return (
    <section className="border-t border-line bg-bg-2">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-24 sm:py-32">
        <p className="label-mono mb-6">Built for operators</p>
        <h2 className="font-display text-headline-lg text-ink max-w-3xl">
          Restaurants. Hospitality. Service businesses.<br />
          Property operations. Local commerce.
        </h2>
        <div className="mt-10 max-w-3xl space-y-6 text-body-md text-ink-muted">
          <p>
            Businesses that move fast do not need more software tabs. They need operational
            systems that reduce friction, automate repetitive work, improve customer experience,
            and help teams move faster with less overhead.
          </p>
          <p className="text-ink">
            That is the shift DELAI is built around.
          </p>
        </div>
      </div>
    </section>
  );
}

function Capabilities() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-24 sm:py-32">
        <p className="label-mono mb-6">What DELAI builds</p>
        <h2 className="font-display text-headline-lg text-ink max-w-2xl">
          Four layers of operational AI.
        </h2>
        <div className="mt-16 grid gap-px bg-line sm:grid-cols-2">
          {CAPABILITIES.map((c) => (
            <div key={c.name} className="bg-bg p-8">
              <h3 className="font-display text-2xl text-ink">{c.name}</h3>
              <p className="mt-4 text-body-md text-ink-muted">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Operations() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-24 sm:py-32">
        <p className="label-mono mb-6">How DELAI operates</p>
        <h2 className="font-display text-headline-lg text-ink max-w-3xl">
          Built for production.
        </h2>
        <div className="mt-8 max-w-3xl space-y-4 text-body-md text-ink-muted">
          <p>
            The goal is not to generate demos. The goal is to create systems that survive
            real operational environments.
          </p>
          <p className="text-ink">That means:</p>
        </div>
        <ul className="mt-10 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
          {OPERATING_PRINCIPLES.map((p) => (
            <li key={p} className="bg-bg p-6 flex items-baseline gap-4">
              <span className="font-mono text-mono-label text-ink-faint">·</span>
              <span className="text-body-md text-ink">{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function NativeNotDecorated() {
  return (
    <section className="border-t border-line bg-bg-2">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-24 sm:py-32">
        <p className="label-mono mb-6">AI-native, not AI-decorated</p>
        <h2 className="font-display text-headline-lg text-ink max-w-3xl">
          Most businesses do not need <span className="italic text-ink-muted">"AI features."</span>
        </h2>
        <p className="mt-8 text-body-md text-ink max-w-3xl">
          They need systems designed around:
        </p>
        <ul className="mt-10 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
          {NATIVE_DIMENSIONS.map((d) => (
            <li key={d} className="bg-bg-2 p-6 flex items-baseline gap-4">
              <span className="font-mono text-mono-label text-ink-faint">·</span>
              <span className="text-body-md text-ink">{d}</span>
            </li>
          ))}
        </ul>
        <p className="mt-12 text-body-md text-ink-muted max-w-3xl">
          DELAI exists to build that future.
        </p>
      </div>
    </section>
  );
}

function FinalCta({ onCta }: { onCta: () => void }) {
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-3xl px-5 sm:px-8 py-24 sm:py-32 text-center">
        <p className="label-mono mb-6">Let's build what's next</p>
        <h2 className="font-display text-headline-lg text-ink">
          The businesses that adapt early<br />
          will not look like traditional software companies.
        </h2>
        <div className="mt-8 max-w-2xl mx-auto space-y-4 text-body-md text-ink-muted">
          <p>
            They will look operationally lighter, faster, and more intelligent at every layer.
          </p>
          <p className="text-ink">
            That transition has already started.
          </p>
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button onClick={onCta} className="btn-primary">Start a conversation</button>
          <a href="mailto:hello@meetdelai.com" className="btn-ghost">hello@meetdelai.com</a>
        </div>
      </div>
    </section>
  );
}
