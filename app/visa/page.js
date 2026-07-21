import Link from 'next/link';
import { ORIGINS, citizensOf, getAllRoutes, getCountryName } from '../../src/lib/routeData';

export const metadata = {
  title: 'Visa requirements by nationality — VisaInfo.ai',
  description:
    'Browse instant visa requirements for dozens of nationalities traveling to popular destinations worldwide, backed by passport-index data.',
  alternates: { canonical: '/visa' },
};

export default function VisaHubPage() {
  const routesByOrigin = new Map();
  for (const route of getAllRoutes()) {
    if (!routesByOrigin.has(route.from)) routesByOrigin.set(route.from, []);
    routesByOrigin.get(route.from).push(route);
  }

  return (
    <div className="visa-hub">
      <h1>Visa requirements by nationality</h1>
      <p>Select your nationality below to see visa requirements for popular destinations.</p>

      {ORIGINS.map((code) => {
        const routes = (routesByOrigin.get(code) || [])
          .map((r) => ({ ...r, toName: getCountryName(r.to) }))
          .sort((a, b) => a.toName.localeCompare(b.toName));
        if (!routes.length) return null;

        return (
          <section key={code} className="visa-hub-section">
            <h2>{citizensOf(code, getCountryName(code))}</h2>
            <ul className="visa-hub-list">
              {routes.map((r) => (
                <li key={r.slug}>
                  <Link href={`/visa/${r.slug}`}>{r.toName}</Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
