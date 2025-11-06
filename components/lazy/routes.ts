import { lazyLoad } from '@/lib/lazy';

// Lazy load route components for code splitting
export const LazyFeaturesPage = lazyLoad(
  () => import('../../app/features/page'),
  { ssr: true }
);

export const LazyDocsPage = lazyLoad(
  () => import('../../app/docs/page'),
  { ssr: true }
);

export const LazyDocsSlugPage = lazyLoad(
  () => import('../../app/docs/[slug]/page'),
  { ssr: true }
);

export const LazyPublicStatsPage = lazyLoad(
  () => import('../../app/public-stats/[guildId]/page'),
  { ssr: true }
);

export const LazyStatusPage = lazyLoad(
  () => import('../../app/status/page'),
  { ssr: true }
);

export const LazyAdminFlagsPage = lazyLoad(
  () => import('../../app/admin/flags/page'),
  { ssr: true }
);
