import { vi } from 'vitest';
import React, { ReactNode } from 'react';
global.IS_REACT_ACT_ENVIRONMENT = true

vi.mock('./app/components/BootstrapPageData');

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: ReactNode; href: string }) => {
    return <a href={ href } {...props
} > { children } </a>;
	},
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));
