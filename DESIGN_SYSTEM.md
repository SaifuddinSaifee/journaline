# Glassmorphism Design System

This design system provides a comprehensive foundation for building modern web applications with glassmorphism effects and seamless light/dark mode support.

## 🎨 Design Principles

### Glassmorphism
- **Transparency**: Use low opacity backgrounds (5%-60%)
- **Blur**: Apply backdrop blur effects (8px-24px)
- **Borders**: Semi-transparent borders for definition
- **Depth**: Subtle shadows and inner highlights
- **Hierarchy**: Varying glass intensities for visual hierarchy

### Color Philosophy
- **Adaptive**: Colors automatically adapt to light/dark mode
- **Subtle**: Low saturation with transparency for elegance
- **Consistent**: Systematic color scales and variants
- **Accessible**: Maintains readability across themes

## 🌈 Color Palette

### Primary Colors
- **Primary**: Blue (`rgb(59, 130, 246)`)
- **Secondary**: Purple (`rgb(139, 92, 246)`)
- **Accent**: Pink (`rgb(236, 72, 153)`)

### Glass Variants
- **Subtle**: 5-20% opacity for backgrounds
- **Default**: 10-40% opacity for cards
- **Strong**: 20-60% opacity for prominent elements

### Text Colors
- **Primary**: High contrast for main content
- **Secondary**: Medium contrast for supporting text
- **Muted**: Low contrast for disabled/meta text

## 🧩 Components

### GlassCard
Primary container component for glassmorphism layouts.

```tsx
<GlassCard variant="default" padding="md" radius="md">
  Content here
</GlassCard>
```

**Variants:**
- `default` - Standard glass effect
- `strong` - Enhanced opacity and blur
- `subtle` - Minimal glass effect
- `primary` - Blue-tinted glass
- `secondary` - Purple-tinted glass
- `accent` - Pink-tinted glass

**Props:**
- `variant`: Glass effect intensity
- `padding`: Internal spacing (none, sm, md, lg, xl)
- `radius`: Border radius (sm, md, lg, xl)
- `hover`: Enable hover animations (default: true)

### GlassButton
Interactive button with glassmorphism styling.

```tsx
<GlassButton variant="primary" size="md" loading={false}>
  Click me
</GlassButton>
```

**Variants:**
- `default` - Neutral glass button
- `primary` - Primary action button
- `secondary` - Secondary action button
- `accent` - Accent/highlight button
- `ghost` - Transparent with hover effect

**Sizes:**
- `sm` - Small (text-sm, compact padding)
- `md` - Medium (default size)
- `lg` - Large (text-lg, generous padding)
- `xl` - Extra large (text-xl, maximum padding)

**States:**
- `loading` - Shows spinner, disables interaction
- `disabled` - Reduced opacity, prevents interaction

### ThemeToggle
Theme switching component for light/dark/system modes.

```tsx
<ThemeToggle />
```

**Features:**
- Three-state toggle (light/dark/system)
- Automatic system preference detection
- Persistent theme selection
- Smooth transitions

### ThemeProvider
Context provider for theme management.

```tsx
<ThemeProvider>
  <App />
</ThemeProvider>
```

**Functionality:**
- Global theme state management
- System preference monitoring
- localStorage persistence
- CSS variable updates

## 🎭 CSS Classes

### Glass Effects
- `.glass` - Default glassmorphism effect
- `.glass-strong` - Enhanced glass effect
- `.glass-subtle` - Minimal glass effect
- `.glass-primary` - Blue-tinted glass
- `.glass-secondary` - Purple-tinted glass
- `.glass-accent` - Pink-tinted glass

### Surface Variants
- `.surface-elevated` - Highest elevation surface
- `.surface-base` - Standard surface level
- `.surface-sunken` - Inset/recessed surface

### Utilities
- `.glass-shimmer` - Animated shimmer effect
- Focus states automatically applied
- Hover animations included

## 🌓 Theme System

### CSS Variables
All colors and effects are defined as CSS variables that automatically adapt to light/dark mode:

```css
:root {
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --text-primary: #1e293b;
  /* ... */
}

@media (prefers-color-scheme: dark) {
  :root {
    --glass-bg: rgba(30, 41, 59, 0.4);
    --glass-border: rgba(148, 163, 184, 0.2);
    --text-primary: #f1f5f9;
    /* ... */
  }
}
```

### Theme Hook
Use the `useTheme` hook to access and control theme state:

```tsx
const { theme, setTheme, effectiveTheme } = useTheme();
```

## 📱 Responsive Design

### Breakpoints
- Mobile: Base styles
- Tablet: `@media (min-width: 768px)`
- Desktop: `@media (min-width: 1024px)`

### Adaptive Glass Effects
- Reduced blur values on mobile for performance
- Responsive padding and sizing
- Touch-friendly interactive areas

## ⚡ Performance Considerations

### Backdrop Blur Optimization
- Use `will-change: transform` sparingly
- Prefer transform animations over layout changes
- Limit simultaneous blur effects

### Memory Management
- Glass effects are GPU-accelerated
- Avoid excessive nesting of glass elements
- Use `contain: layout style paint` when appropriate

## 🎯 Usage Guidelines

### Do's
✅ Use glass effects for UI chrome and overlays
✅ Maintain consistent blur and opacity values
✅ Ensure sufficient contrast for text readability
✅ Test in both light and dark modes
✅ Use semantic HTML with glass styling

### Don'ts
❌ Overuse glass effects (causes visual noise)
❌ Use glass on small text elements
❌ Stack too many transparent layers
❌ Ignore accessibility requirements
❌ Mix glassmorphism with other design languages

## 🚀 Getting Started

1. **Import components:**
   ```tsx
   import { GlassCard, GlassButton, ThemeToggle } from './components';
   ```

2. **Wrap your app:**
   ```tsx
   <ThemeProvider>
     <YourApp />
   </ThemeProvider>
   ```

3. **Use glass components:**
   ```tsx
   <GlassCard variant="default">
     <GlassButton variant="primary">
       Get Started
     </GlassButton>
   </GlassCard>
   ```

## 🔧 Customization

### Extending Colors
Add new glass variants by extending the CSS variables:

```css
:root {
  --glass-success: rgba(34, 197, 94, 0.1);
  --glass-warning: rgba(245, 158, 11, 0.1);
  --glass-error: rgba(239, 68, 68, 0.1);
}
```

### Custom Components
Follow the existing patterns when creating new components:

```tsx
interface CustomGlassComponentProps {
  variant?: 'default' | 'custom';
  // ... other props
}

const CustomGlassComponent = ({ variant, ...props }) => {
  return (
    <div className={cn('glass', variantClasses[variant], className)}>
      {children}
    </div>
  );
};
```

## 📊 Browser Support

- **Modern browsers**: Full support with hardware acceleration
- **Safari**: Requires `-webkit-backdrop-filter` prefix (included)
- **Firefox**: Backdrop filter support from version 103+
- **Graceful degradation**: Fallbacks for unsupported browsers

## 🎨 Design Tokens

All design tokens are centralized in CSS variables for easy theming:

- **Spacing**: Consistent padding and margin scales
- **Typography**: Font families, sizes, and weights
- **Colors**: Semantic color naming with variants
- **Shadows**: Layered shadow system for depth
- **Borders**: Radius and opacity standards
- **Animation**: Consistent timing and easing

This design system ensures consistency, accessibility, and maintainability across your entire application while providing the flexibility to customize and extend as needed. 