# UI Guidelines

This document outlines the unified UI patterns and components used across the Slimy.ai Web project.

## Design Principles

- **Mobile-first**: All components are optimized for mobile devices with proper touch targets
- **Consistency**: Use unified card and callout styles across all pages
- **Accessibility**: Components include proper ARIA labels and semantic HTML

## Components

### Cards

Cards are the primary content container used throughout the site.

**Location**: `components/ui/card.tsx`

**Usage**:
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description text</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Card content goes here */}
  </CardContent>
</Card>
```

**Style tokens**:
- Background: `hsl(var(--card))`
- Border: `border` from theme
- Border radius: `rounded-lg`
- Padding: `p-6` (header), `px-6 pb-6` (content)
- Shadow: `shadow-sm`

**Mobile optimizations**:
- Minimum touch target height: 44px
- Responsive padding: scales down on mobile
- Stack layout on small screens

### Callouts

Callouts are used for inline notes, warnings, and informational messages.

**Location**: `components/ui/callout.tsx`

**Variants**:
- `info` (default): Blue border and background
- `success`: Green border and background
- `warn`: Yellow border and background
- `error`: Red border and background

**Usage**:
```tsx
import { Callout } from "@/components/ui/callout";

<Callout variant="info">
  This is an informational message.
</Callout>

<Callout variant="warn" icon={false}>
  Warning without icon
</Callout>
```

**Style tokens per variant**:

**Info**:
- Border: `border-blue-500/50`
- Background: `bg-blue-500/10`
- Text: `text-blue-600 dark:text-blue-400`

**Success**:
- Border: `border-green-500/50`
- Background: `bg-green-500/10`
- Text: `text-green-600 dark:text-green-400`

**Warn**:
- Border: `border-yellow-500/50`
- Background: `bg-yellow-500/10`
- Text: `text-yellow-600 dark:text-yellow-400`

**Error**:
- Border: `border-red-500/50`
- Background: `bg-red-500/10`
- Text: `text-red-600 dark:text-red-400`

**Common styles**:
- Layout: `flex gap-3`
- Padding: `p-4`
- Border radius: `rounded-lg`
- Border width: `border`

### Buttons

Standard button variants for consistent interaction patterns.

**Location**: `components/ui/button.tsx`

**Variants**:
- `default`: Primary action button
- `neon`: Highlighted action with neon-green accent
- `outline`: Secondary action button
- `ghost`: Tertiary/subtle action
- `destructive`: Dangerous/delete actions

**Sizes**:
- `default`: Standard size (h-10)
- `sm`: Small size (h-9)
- `lg`: Large size (h-11)
- `icon`: Square icon button

### Badges

Small status indicators and labels.

**Location**: `components/ui/badge.tsx`

**Variants**:
- `default`: Primary badge
- `secondary`: Muted badge
- `destructive`: Error/warning badge
- `outline`: Bordered badge

## Brand Colors

Brand-specific colors from the Slimy.ai logo:

```css
--neon-green: #00FF41      /* Bright green from spiral */
--lime-green: #7FFF00      /* Light green accent */
--purple: #8B4FBF          /* Purple from snail body */
--dark-purple: #6B3FA0     /* Darker purple shade */
--gray-dark: #595F6B       /* Gray from snail body */
```

## Mobile Responsiveness

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Layout Guidelines
- Use `container` class for page-level wrappers
- Apply `px-4` for mobile padding
- Use `flex-col` on mobile, `flex-row` on tablet+
- Stack cards vertically on mobile

### Touch Targets
- Minimum height: 44px
- Minimum width: 44px
- Spacing between interactive elements: 8px minimum

## Typography

### Headings
- `h1`: `text-4xl font-bold` (mobile), `text-5xl` (desktop)
- `h2`: `text-3xl font-semibold`
- `h3`: `text-2xl font-semibold`
- `h4`: `text-xl font-semibold`

### Body Text
- Default: `text-base leading-7`
- Muted: `text-muted-foreground`
- Small: `text-sm`

## Best Practices

1. **Consistency**: Always use the card component for content sections
2. **Feedback**: Use callouts for user feedback and important notes
3. **Spacing**: Maintain consistent gap between elements (`space-y-4` or `gap-4`)
4. **Icons**: Use lucide-react icons with consistent sizing (`h-4 w-4` for small, `h-5 w-5` for medium)
5. **Dark Mode**: All components support dark mode out of the box via CSS variables

## Examples

### Feature Card Pattern
```tsx
<Card>
  <CardHeader>
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-neon-green" />
      <CardTitle>Feature Name</CardTitle>
    </div>
    <CardDescription>Brief description of the feature</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-muted-foreground">
      Detailed content goes here...
    </p>
  </CardContent>
</Card>
```

### Status Message Pattern
```tsx
<Callout variant="success">
  <p className="font-medium">Success!</p>
  <p className="text-sm">Your action was completed successfully.</p>
</Callout>
```

## Future Considerations

- Add loading skeleton components for better perceived performance
- Implement toast notifications for transient feedback
- Consider adding animation utilities for micro-interactions
