import { lazyLoad, lazyLoadHeavy } from '@/lib/lazy';

// Lazy load heavy components that are not immediately needed
export const LazyAnalyticsDashboard = lazyLoadHeavy(
  () => import('../analytics/Dashboard')
);

// Lazy load SSR-capable components
export const LazyChatInterface = lazyLoad(
  () => import('../chat/chat-interface'),
  { ssr: true }
);

export const LazyClubResults = lazyLoad(
  () => import('../club/Results'),
  { ssr: true }
);

// Lazy load heavy UI components that aren't needed immediately
export const LazySnailTimeline = lazyLoadHeavy(
  () => import('../snail-timeline')
);

// Lazy load SlimeChatBar - heavy component with chat window
export const LazySlimeChatBar = lazyLoadHeavy(
  () => import('../slime-chat/slime-chat-bar').then(mod => ({ default: mod.SlimeChatBar }))
);

// Lazy load ScreenshotViewer - heavy component with image processing
export const LazyScreenshotViewer = lazyLoadHeavy(
  () => import('../screenshot/Viewer').then(mod => ({ default: mod.ScreenshotViewer }))
);

// Export all lazy components
export * from './routes';
