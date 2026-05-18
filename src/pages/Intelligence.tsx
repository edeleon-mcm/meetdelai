import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TopNav } from '@/components/TopNav';
import { Footer } from '@/components/Footer';
import { Seo } from '@/components/Seo';
import { listArticles, type ArticleSummary } from '@/lib/api';

const PAGE_SIZE = 24;

export function Intelligence() {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    listArticles({ limit: PAGE_SIZE }).then((a) => {
      setArticles(a);
      setHasMore(a.length === PAGE_SIZE);
      setLoading(false);
    });
  }, []);

  async function loadMore() {
    setLoadingMore(true);
    const next = await listArticles({ limit: PAGE_SIZE, offset: articles.length });
    setArticles((prev) => [...prev, ...next]);
    setHasMore(next.length === PAGE_SIZE);
    setLoadingMore(false);
  }

  return (
    <>
      <Seo
        title="Writing — DELAI"
        description="Essays on AI-native software, operator discipline, and building from scratch."
      />
      <TopNav />
      <main className="mx-auto max-w-6xl px-5 sm:px-8 pt-20 sm:pt-32 pb-24">
        <section>
          <p className="label-mono mb-6">Writing</p>
          <h1 className="font-display text-headline-xl text-ink max-w-3xl">
            Notes from the operator chair.
          </h1>
          <p className="mt-6 text-body-lg text-ink-muted max-w-2xl">
            Lessons from shipping AI-native software end-to-end. Engineering, operating,
            and the gap between what teams say they want and what actually moves the needle.
          </p>
        </section>

        <section className="mt-20 space-y-12">
          {loading ? (
            <p className="label-mono">Loading…</p>
          ) : articles.length === 0 ? (
            <div className="border border-line p-12 text-center">
              <p className="label-mono">No essays yet</p>
              <p className="mt-3 text-body-md text-ink-muted max-w-md mx-auto">
                The archive is empty. Check back soon, or send a note —{' '}
                <a href="mailto:hello@meetdelai.com" className="text-ink hover:underline">
                  hello@meetdelai.com
                </a>
                .
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-px bg-line">
                {articles.map((a) => (
                  <ArticleRow key={a.id} a={a} />
                ))}
              </div>
              {hasMore ? (
                <div className="flex justify-center pt-4">
                  <button onClick={loadMore} disabled={loadingMore} className="btn-ghost">
                    {loadingMore ? 'Loading…' : 'Load more'}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

function ArticleRow({ a }: { a: ArticleSummary }) {
  return (
    <Link
      to={`/intelligence/${a.slug}`}
      className="block bg-bg p-6 sm:p-8 transition-colors hover:bg-bg-2"
    >
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-8">
        <p className="font-mono text-mono-label text-ink-faint shrink-0 sm:w-32">
          {new Date(a.published_at).toISOString().slice(0, 10)}
        </p>
        <div className="flex-1 mt-2 sm:mt-0">
          <h2 className="font-display text-headline-md text-ink">{a.title}</h2>
          {a.hook ? <p className="mt-2 text-body-md text-ink-muted">{a.hook}</p> : null}
          <p className="mt-3 font-mono text-mono-label text-ink-faint">
            {a.category.replace('_', ' ').toUpperCase()} · {a.reading_time_min || 5} min
          </p>
        </div>
      </div>
    </Link>
  );
}
