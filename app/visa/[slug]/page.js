import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  CATEGORY_LABELS,
  LONG_STAY_NOTE,
  VISA_LABELS,
  citizensOf,
  formatUpdatedDate,
  getAllRoutes,
  getRelatedRoutes,
  getRouteBySlug,
  getRouteInfo,
} from '../../../src/lib/routeData';

export const dynamicParams = false;

const BADGE_CLASSES = {
  visa_free: 'badge-visa-free',
  eta: 'badge-eta',
  e_visa: 'badge-e-visa',
  visa_on_arrival: 'badge-voa',
  visa_required: 'badge-visa-required',
  no_admission: 'badge-no-admission',
  unknown: 'badge-unknown',
};

export async function generateStaticParams() {
  return getAllRoutes().map(({ slug }) => ({ slug }));
}

function buildTitle(info) {
  return `Do ${citizensOf(info.from, info.fromName)} need a visa for ${info.toName}?`;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const route = getRouteBySlug(slug);
  if (!route) return {};

  const info = getRouteInfo(route.from, route.to);
  const year = info.dataUpdatedAt ? new Date(info.dataUpdatedAt).getFullYear() : new Date().getFullYear();
  const title = `${buildTitle(info)} (${year})`;
  const description = `${info.label} — ${citizensOf(info.from, info.fromName)} traveling to ${info.toName} for tourism. ${info.description}`;

  return {
    title,
    description,
    alternates: { canonical: `/visa/${slug}` },
  };
}

export default async function VisaRoutePage({ params }) {
  const { slug } = await params;
  const route = getRouteBySlug(slug);
  if (!route) notFound();

  const info = getRouteInfo(route.from, route.to);
  const related = getRelatedRoutes(route.from, route.to, 10);
  const updatedLabel = formatUpdatedDate(info.dataUpdatedAt);
  const badgeClass = BADGE_CLASSES[info.category] || 'badge-unknown';
  const title = buildTitle(info);
  const ctaHref = `/?res=${route.from}&nat=${route.from}&to=${route.to}&reason=tourism`;

  const faqEntries = [
    { q: title, a: `${info.label}. ${info.description}` },
  ];
  if (info.category === 'visa_free' && info.maxStayDays) {
    faqEntries.push({
      q: `How long can ${citizensOf(info.from, info.fromName)} stay in ${info.toName} without a visa?`,
      a: `${citizensOf(info.from, info.fromName)} can stay in ${info.toName} for up to ${info.maxStayDays} days without a visa.`,
    });
  }
  faqEntries.push({
    q: `Can I work in ${info.toName} with a tourist visa?`,
    a: `No. Working or studying in ${info.toName} generally requires a purpose-specific visa or permit, even where tourist entry is visa-free.`,
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqEntries.map((entry) => ({
      '@type': 'Question',
      name: entry.q,
      acceptedAnswer: { '@type': 'Answer', text: entry.a },
    })),
  };

  return (
    <div className="visa-route">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="visa-route-title">{title}</h1>
      <p className="visa-route-answer">
        {info.label}. {info.description}
      </p>
      <span className={`badge ${badgeClass}`}>{info.label}</span>

      {info.maxStayDays != null && (
        <p className="visa-route-stay">Stay up to {info.maxStayDays} days without a visa.</p>
      )}

      <section className="visa-route-section">
        <h2>Traveling for work or study?</h2>
        <p>{LONG_STAY_NOTE}</p>
      </section>

      {info.waivers.length > 0 && (
        <section className="visa-route-section">
          <h2>Visa waivers for {info.toName}</h2>
          <ul className="visa-route-waivers">
            {info.waivers.map((rule) => (
              <li key={`${rule.heldVisas.join(',')}-${rule.requirement}`}>
                Holders of a valid{' '}
                {rule.heldVisas.map((v) => VISA_LABELS[v] || v).join(' / ')} visa:{' '}
                {CATEGORY_LABELS[rule.requirement] || rule.requirement}, up to{' '}
                {rule.maxStayDays} days — {rule.conditions}
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link href={ctaHref} className="submit-btn visa-route-cta">
        Check your exact requirements
      </Link>

      {related.length > 0 && (
        <section className="visa-route-section">
          <h2>{citizensOf(info.from, info.fromName)} traveling to other destinations</h2>
          <ul className="visa-route-related">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/visa/${r.slug}`}>{r.toName}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="disclaimer">
        <span>
          This information is AI-generated and may not reflect current requirements.
          Always verify with official embassy or consulate sources before making travel plans.
          This tool provides general information, not legal advice.
        </span>
      </div>
      {updatedLabel && <p className="data-updated-note">Passport-index data updated {updatedLabel}</p>}
    </div>
  );
}
