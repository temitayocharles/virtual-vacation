/**
 * Design System Tokens
 * Centralized design language for the entire application
 * All pages and components should reference these tokens
 */

export const designSystem = {
  // Color Palette
  colors: {
    // Primary Gradients
    primary: {
      start: '#00ffff',      // Cyan
      mid: '#8b5cf6',        // Purple
      end: '#ff6b6b',        // Pink
      light: 'from-cyan-400 via-purple-400 to-pink-400',
      dark: 'from-cyan-500 via-purple-500 to-pink-500',
    },

    // Background Gradients
    background: {
      light: 'from-blue-50 to-indigo-100',
      dark: 'from-slate-900 via-purple-900 to-slate-900',
      hero: 'from-indigo-900 via-purple-900 to-pink-900',
    },

    // Text Colors
    text: {
      primary: '#1f2937',      // gray-900
      secondary: '#6b7280',    // gray-500
      light: '#f3f4f6',        // gray-100
      white: '#ffffff',
      muted: 'text-gray-500',
    },

    // Accent Colors
    accents: {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      indigo: 'from-indigo-500 to-indigo-600',
      red: 'from-red-500 to-red-600',
    },

    // Interactive States
    interactive: {
      primary: '#3b82f6',      // blue-500
      primaryHover: '#2563eb', // blue-600
      success: '#10b981',      // green-500
      warning: '#f59e0b',      // amber-500
      error: '#ef4444',        // red-500
    },
  },

  // Spacing Scale (based on 4px)
  spacing: {
    xs: '0.5rem',      // 8px
    sm: '1rem',        // 16px
    md: '1.5rem',      // 24px
    lg: '2rem',        // 32px
    xl: '3rem',        // 48px
    '2xl': '4rem',     // 64px
    '3xl': '6rem',     // 96px
    '4xl': '8rem',     // 128px
  },

  // Layout
  layout: {
    containerMaxWidth: 'max-w-6xl',
    contentMaxWidth: 'max-w-4xl',
    narrowMaxWidth: 'max-w-3xl',
    sectionPadding: 'py-20 px-6',
    sectionPaddingMobile: 'py-12 px-4',
    contentPadding: 'px-6',
    contentPaddingMobile: 'px-4',
    sectionWithPadding: 'max-w-6xl mx-auto py-20 px-6',
    sectionWithPaddingMobile: 'max-w-full mx-auto py-12 px-4',
  },

  // Typography
  typography: {
    // Headings
    h1: 'text-5xl md:text-6xl font-bold',
    h1Large: 'text-6xl md:text-7xl font-bold',
    h2: 'text-4xl md:text-5xl font-bold',
    h3: 'text-2xl font-bold',
    h4: 'text-xl font-semibold',

    // Body Text
    body: {
      lg: 'text-lg leading-relaxed',
      base: 'text-base leading-relaxed',
      sm: 'text-sm leading-relaxed',
    },

    // Display
    display: 'text-3xl md:text-4xl font-bold',
    subtitle: 'text-xl md:text-2xl text-gray-600',

    // Semantic
    gradient: 'text-gradient',
  },

  // Shadows
  shadows: {
    sm: 'shadow-sm',
    base: 'shadow',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
    glass: 'shadow-lg backdrop-blur-md',
  },

  // Border Radius
  borderRadius: {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    full: 'rounded-full',
  },

  // Animations
  animations: {
    // Entrance animations
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.8 },
    },
    fadeInUp: {
      initial: { opacity: 0, y: 50 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.8 },
    },
    fadeInLeft: {
      initial: { opacity: 0, x: -50 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.8 },
    },
    fadeInRight: {
      initial: { opacity: 0, x: 50 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.8 },
    },
    slideDown: {
      initial: { opacity: 0, y: -30 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6 },
    },

    // Scale animations
    scaleIn: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.5 },
    },
    scaleUp: {
      whileHover: { scale: 1.05 },
      transition: { duration: 0.2 },
    },

    // Hover animations
    hoverScale: {
      whileHover: { scale: 1.05 },
    },
    hoverShadow: {
      whileHover: { boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' },
    },
  },

  // Breakpoints
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },

  // Component Sizes
  sizes: {
    // Button sizes
    button: {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    },
    // Icon sizes
    icon: {
      sm: 24,
      md: 32,
      lg: 40,
      xl: 48,
    },
    // Card sizes
    card: {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
  },

  // Glass Morphism
  glass: {
    light: 'bg-white/10 backdrop-blur-md border border-white/20',
    medium: 'bg-white/20 backdrop-blur-lg border border-white/30',
    dark: 'bg-black/20 backdrop-blur-md border border-black/10',
    card: 'glass-card p-8 bg-white/5 backdrop-blur-md',
  },

  // Standard Card Styles
  cards: {
    travel: 'travel-card',
    glass: 'glass-card',
    standard: 'rounded-xl border border-gray-200 shadow-lg',
  },

  // Transition Speeds
  transitions: {
    fast: '150ms ease-in-out',
    base: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  },
};

// Helper function to merge design tokens
export const mergeDesignTokens = (base: any, override: any) => {
  return { ...base, ...override };
};

// Export commonly used combinations
export const designPresets = {
  // Section wrapper
  sectionWrapper: `${designSystem.layout.containerMaxWidth} mx-auto`,
  sectionWithPadding: `${designSystem.layout.sectionPadding} ${designSystem.layout.containerMaxWidth} mx-auto`,

  // Hero section
  heroBackground: `bg-gradient-to-br ${designSystem.colors.background.dark} text-white`,
  heroTitle: designSystem.typography.h1Large,
  heroSubtitle: 'text-xl md:text-2xl text-gray-300',

  // Card
  cardBase: `rounded-xl shadow-lg hover:shadow-2xl transition-shadow`,
  travelCard: designSystem.cards.travel,

  // Button
  buttonPrimary: 'px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors',
  buttonSecondary: 'px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-900 hover:bg-gray-50 transition-colors',

  // Typography
  heading: designSystem.typography.h2,
  subheading: designSystem.typography.h3,
  bodyText: designSystem.typography.body.lg,
  smallText: designSystem.typography.body.sm,
};
