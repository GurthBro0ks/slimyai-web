'use client';

export const ROUTES = {
  docs: (slug: string) => `/docs/${slug}`,
  publicStats: (guildId: string) => `/public-stats/${guildId}`,
  club: '/club',
};
