# Changelog

All notable changes to the Slimy.ai Web project will be documented in this file.

## [Unreleased]

### Mobile Polish v1 - 2025-10-31

**Summary**: Finalized Mobile Polish v1 implementation with comprehensive refactoring and test environment setup.

**UI/UX Enhancements**:
- Unified card components with consistent spacing and mobile-optimized touch targets
- Compact callout variants (info, success, warn, error) for inline feedback
- Responsive header and hero sections with mobile-first design
- Improved footer with smooth scroll behavior
- Mobile-optimized navigation and status indicators

**Code Quality Improvements**:

1. **Server Component Compliance** (Next.js 16)
   - Fixed React hook usage in async server components
   - Extracted `baseMDXComponents` for server-side MDX compilation
   - Maintained `useMDXComponents` hook for client components

2. **React Best Practices**
   - Wrapped async functions with `useCallback` to fix dependency warnings
   - Fixed missing dependencies in `useEffect` hooks
   - Eliminated synchronous `setState` triggers in effects

3. **ES Module Migration**
   - Replaced `require()` with ES `import` statements across codebase
   - Updated `lib/rate-limiter.ts`, `tailwind.config.ts`, and test files
   - Improved tree-shaking and bundle size

4. **TypeScript Type Safety**
   - Eliminated all `any` types with proper interfaces
   - Added `ChatBotRequest`, `GuildFlagsUpdate`, `SnelpCodeRaw` interfaces
   - Improved type inference and IDE support

5. **Test Infrastructure**
   - Installed `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`
   - Created test setup file with cleanup utilities
   - Added smoke tests for status page component
   - Configured Vitest with jsdom environment

**Documentation**:
- Updated README.md with Mobile Polish v1 feature summary
- Created `docs/ui-guidelines.md` with comprehensive component documentation
- Documented unified card and callout class tokens for future contributors
- Added test environment setup instructions

**Files Modified**:
- `components/mdx-components.tsx` - Extracted base components
- `app/docs/[slug]/page.tsx` - Fixed server component hook usage
- `app/status/page.tsx` - Fixed useEffect dependencies
- `app/snail/codes/page.tsx` - Fixed useEffect dependencies
- `lib/rate-limiter.ts` - ES module import
- `tailwind.config.ts` - ES module import
- `tests/unit/rate-limiter.test.ts` - ES module pattern
- `app/api/chat/bot/route.ts` - Type safety
- `app/api/guilds/[id]/settings/route.ts` - Type safety
- `lib/codes-aggregator.ts` - Type safety
- `vitest.config.ts` - Added setup files
- `package.json` - Added test dependencies

**Related**: See PR #1 for full implementation details and visual examples.

---

## Previous Updates

For earlier changes, see the main repository CHANGELOG or git history.
