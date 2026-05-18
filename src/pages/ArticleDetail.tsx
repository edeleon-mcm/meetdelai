import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { marked } from 'marked';
import { TopNav } from '@/components/TopNav';
import { Footer } from '@/components/Footer';
import { LeadCaptureModal } from '@/components/LeadCaptureModal';
import { Seo, articleSchema } from '@/components/Seo';
import { getArticle, type Article } from '@/lib/api';

export function ArticleDetail() {
  const { slug = '' } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [openCta, setOpenCta] = useState(false);

  useEffect(() => {
    setLoading(true);
    getArticle(slug).then((a) => {
      setArticle(a);
      setLoading(false);
    });
  }, [slug]);

  return (
    <>
      {article ? (
        <Seo
          title={`${article.title} — DELAI`}
          description={article.hook || article.title}
          jsonLd={articleSchema({
            title: article.title,
            description: article.hook || article.title,
            url: `https://meetdelai.com/intelligence/${article.slug}`,
            datePublished: article.published_at,
            image: article.hero_image_url,
          })}
        />
      ) : null}
      <TopNav />
      <main className="mx-auto max-w-3xl px-5 sm:px-8 pt-20 sm:pt-32 pb-24">
        {loading ? (
          <p className="label-mono">Loading…</p>
        ) : !article ? (
          <div className="border border-line p-12 text-center">
            <p className="label-mono">Not found</p>
            <Link to="/intelligence" className="btn-ghost mt-6 inline-flex">Back to writing</Link>
          </div>
        ) : (
          <article className="space-y-8">
            <div>
              <Link to="/intelligence" className="font-mono text-mono-label text-ink-muted hover:text-ink">
                ← Writing
              </Link>
            </div>
            <header className="space-y-4">
              <p className="label-mono">{article.category.replace('_', ' ').toUpperCase()}</p>
              <h1 className="font-display text-headline-lg text-ink">{article.title}</h1>
              {article.hook ? <p className="text-body-lg text-ink-muted">{article.hook}</p> : null}
              <p className="font-mono text-mono-label text-ink-faint">
                {new Date(article.published_at).toISOString().slice(0, 10)} ·{' '}
                {article.reading_time_min || 5} min read
              </p>
            </header>

            {article.hero_image_url ? (
              <div className="border border-line">
                <img src={article.hero_image_url} alt="" className="w-full block" />
              </div>
            ) : null}

            <div
              className="prose prose-invert max-w-none font-body
                         prose-headings:font-display prose-headings:text-ink prose-headings:font-normal
                         prose-h2:mt-10 prose-h2:text-2xl
                         prose-h3:mt-6 prose-h3:text-xl
                         prose-p:text-body-md prose-p:text-ink
                         prose-a:text-ink prose-a:underline prose-a:underline-offset-4
                         prose-code:bg-bg-2 prose-code:text-ink prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono
                         prose-pre:bg-bg-2 prose-pre:border prose-pre:border-line
                         prose-blockquote:border-l prose-blockquote:border-ink-muted prose-blockquote:pl-6 prose-blockquote:text-ink-muted prose-blockquote:not-italic
                         prose-li:text-ink prose-strong:text-ink"
              dangerouslySetInnerHTML={{
                __html: article.body_html || (marked.parse(article.body_md) as string),
              }}
            />

            {article.source_links && article.source_links.length > 0 ? (
              <div className="border-t border-line pt-6 mt-12">
                <p className="label-mono mb-3">Sources</p>
                <ul className="space-y-2 text-body-md">
                  {article.source_links.map((s, i) => (
                    <li key={i}>
                      <a className="text-ink-muted hover:text-ink underline underline-offset-4" href={s.url} target="_blank" rel="noreferrer">
                        {s.title || s.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="border border-line p-8 mt-16">
              <p className="label-mono mb-3">Want to work together?</p>
              <h3 className="font-display text-headline-md text-ink">
                One reply, real answer.
              </h3>
              <p className="mt-3 text-body-md text-ink-muted">
                Advisory, fractional CTO, or full build engagements.
              </p>
              <button onClick={() => setOpenCta(true)} className="btn-primary mt-6">Start a conversation</button>
            </div>
          </article>
        )}
      </main>
      <Footer />
      <LeadCaptureModal open={openCta} onClose={() => setOpenCta(false)} source={`article:${slug}`} />
    </>
  );
}
