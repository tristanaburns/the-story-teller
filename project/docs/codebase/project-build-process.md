# The Story Teller: Build Process

*Last Updated: 2025-04-22*

This document outlines the complete build process for The Story Teller application, from development to production deployment.

## Development Environment Setup

### Prerequisites

- Node.js v18.17.0 or later
- npm v9.6.7 or later
- Git v2.40.0 or later

### Initial Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/organization/the-story-teller.git
   cd the-story-teller
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration values
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Build Pipeline

### Development Build

The development build includes:

- Hot Module Replacement (HMR)
- Source maps for debugging
- Development-specific environment variables
- Unminified code for easier debugging

```bash
npm run dev
```

This command runs Next.js in development mode, which provides:
- Fast Refresh for React components
- Dynamic code compilation
- Automatic error reporting
- API route hot reloading

### Production Build

The production build process optimizes the application for performance:

1. Generate static HTML where possible
2. Minify JavaScript and CSS
3. Optimize images and fonts
4. Generate service worker for offline capabilities
5. Create JS/CSS bundles with proper code splitting

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run start
```

## Build Configuration

### Next.js Configuration

The primary build configuration is defined in `next.config.js`:

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.example.com', 's3.amazonaws.com'],
    formats: ['image/avif', 'image/webp'],
  },
  i18n: {
    locales: ['en', 'fr', 'es'],
    defaultLocale: 'en',
  },
  experimental: {
    appDir: true,
    serverActions: true,
    serverComponentsExternalPackages: ['mongoose'],
  },
  webpack: (config, { isServer }) => {
    // Custom webpack configurations
    if (!isServer) {
      // Client-side specific webpack config
    }
    
    // Enable source maps in production
    if (!isServer) {
      config.devtool = 'source-map';
    }
    
    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);
```

### TypeScript Configuration

TypeScript is configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Tailwind CSS Configuration

Tailwind CSS is configured in `tailwind.config.js` for styling:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Custom theme extensions
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};
```

## Build Optimization Techniques

### Code Splitting

The application uses Next.js automatic code splitting at the page level. We also implement:

- Dynamic imports for large components:
  ```tsx
  const DynamicEditor = dynamic(() => import('@/components/editor/TextEditor'), {
    loading: () => <EditorSkeleton />,
    ssr: false,
  });
  ```

- Route-based code splitting with Next.js App Router

### Image Optimization

All images are optimized using:

1. Next.js Image component with automatic WebP/AVIF conversion
2. Responsive sizing with appropriate `sizes` attribute
3. Lazy loading for off-screen images

Example implementation:

```tsx
import Image from 'next/image';

export function OptimizedImage({ src, alt }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={600}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      placeholder="blur"
      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEtAJJJ/x8jgAAAABJRU5ErkJggg=="
      className="rounded-lg object-cover"
      priority={false}
    />
  );
}
```

### Bundle Analysis

We regularly analyze bundle sizes using:

```bash
ANALYZE=true npm run build
```

This generates a visual representation of the bundle sizes, helping identify opportunities for further optimization.

## Continuous Integration and Deployment (CI/CD)

### GitHub Actions Workflow

The CI/CD pipeline is implemented with GitHub Actions in `.github/workflows/main.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, development ]
  pull_request:
    branches: [ main, development ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18.x'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run linting
        run: npm run lint
      - name: Run type checking
        run: npm run typecheck
      - name: Run tests
        run: npm run test

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' || github.event.pull_request.head.repo.full_name == github.repository
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18.x'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build application
        run: npm run build
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-output
          path: .next/

  deploy-preview:
    needs: build
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-output
          path: .next/
      - name: Set up Vercel CLI
        run: npm install --global vercel@latest
      - name: Deploy to Vercel (Preview)
        run: vercel deploy --token=${{ secrets.VERCEL_TOKEN }} --yes

  deploy-production:
    needs: build
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-output
          path: .next/
      - name: Set up Vercel CLI
        run: npm install --global vercel@latest
      - name: Deploy to Vercel (Production)
        run: vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }} --yes
```

### Deployment Environments

The application is deployed to three environments:

1. **Development**: Automatically deployed from the `development` branch
2. **Staging**: Manually promoted from successful development builds
3. **Production**: Automatically deployed from the `main` branch after passing all tests

## Build Scripts

The following npm scripts are defined in `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:ci": "jest --ci --coverage",
    "e2e": "cypress run",
    "e2e:open": "cypress open",
    "analyze": "ANALYZE=true next build",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

## Pre-commit Hooks

We use Husky and lint-staged to enforce code quality before commits:

```json
// .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged

// package.json (excerpt)
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

## Environment-Specific Builds

The application supports different environments through environment variables:

- `.env.development` - Development settings
- `.env.test` - Test environment settings
- `.env.production` - Production settings

Environment-specific behavior is implemented in configuration files:

```typescript
// lib/config/index.ts
const environment = process.env.NODE_ENV || 'development';

export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  isDevelopment: environment === 'development',
  isProduction: environment === 'production',
  isTest: environment === 'test',
  analytics: {
    enabled: environment === 'production',
    trackingId: process.env.NEXT_PUBLIC_ANALYTICS_ID,
  },
  features: {
    aiAssistant: process.env.NEXT_PUBLIC_FEATURE_AI_ASSISTANT === 'true',
    collaborativeEditing: process.env.NEXT_PUBLIC_FEATURE_COLLAB_EDITING === 'true',
  },
};
```

## Performance Monitoring

The build process includes integration with performance monitoring tools:

### Web Vitals Tracking

```typescript
// lib/analytics/index.ts
import { NextWebVitalsMetric } from 'next/app';

export function reportWebVitals(metric: NextWebVitalsMetric) {
  // When in production, send to analytics
  if (process.env.NODE_ENV === 'production') {
    const body = JSON.stringify(metric);
    
    // Send to your analytics service
    fetch('/api/analytics/vitals', {
      body,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  } else {
    // Log to console in development
    console.log(metric);
  }
}
```

### Sentry Integration

For error monitoring, Sentry is integrated in the build process:

```javascript
// sentry.server.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: process.env.NODE_ENV === 'development',
});
```

## Accessibility Testing

The build pipeline includes automatic accessibility testing:

```bash
# In CI/CD pipeline
npm run test:a11y
```

This uses jest-axe to check for accessibility violations:

```typescript
// tests/a11y/button.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '@/components/ui/Button';

expect.extend(toHaveNoViolations);

describe('Button accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Button>Test Button</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## Deployment Process

The full deployment process follows these steps:

1. **Build Trigger**: Code is pushed to a branch or a PR is created
2. **Continuous Integration**: Tests and linting run on GitHub Actions
3. **Build Process**: Next.js application is built with optimizations
4. **Artifact Creation**: Build artifacts are saved
5. **Preview Deployment**: For PRs, a preview deployment is created
6. **Production Deployment**: For main branch, production deployment is triggered
7. **Post-Deployment Verification**: Automated tests run against the deployment
8. **Monitoring**: Performance and error monitoring begins

### Rollback Procedure

In case of deployment failure, we have an automated rollback procedure:

1. Failed deployments trigger a notification
2. The previous successful deployment is automatically restored
3. Error logs are captured for analysis

## Relation to Other Documentation

This build process documentation connects to:

- **Project Architecture**: For understanding how the build process fits into the overall system
- **Deployment Guide**: For detailed steps for manual deployments if needed
- **Monitoring and Logging**: For information on how to monitor build and deployment status
- **Contributing Guide**: For developers to understand how to work with the build process 