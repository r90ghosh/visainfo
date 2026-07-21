import { DATA_UPDATED_AT, getAllRoutes } from '../src/lib/routeData';

const BASE_URL = 'https://visainfo.ai';

export default function sitemap() {
  const lastModified = DATA_UPDATED_AT ? new Date(DATA_UPDATED_AT) : new Date();

  return [
    { url: `${BASE_URL}/`, lastModified },
    { url: `${BASE_URL}/visa`, lastModified },
    { url: `${BASE_URL}/privacy`, lastModified },
    ...getAllRoutes().map((route) => ({
      url: `${BASE_URL}/visa/${route.slug}`,
      lastModified,
    })),
  ];
}
