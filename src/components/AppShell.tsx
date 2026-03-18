import { ReactNode } from 'react';
import BottomNav from '@/components/BottomNav';
import CartPill from '@/components/CartPill';
import GenderBackground from '@/components/GenderBackground';

interface AppShellProps {
  children: ReactNode;
  hideNav?: boolean;
}

/**
 * AppShell — Flutter WebView-compatible layout container.
 *
 * Architecture:
 * ┌─────────────────────── #root (100% height, flex column, overflow hidden) ──┐
 * │  ┌─── AppShell (flex-1, relative, overflow hidden) ─────────────────────┐  │
 * │  │  ┌─── scroll-area (flex-1, overflow-y auto) ────────────────────┐    │  │
 * │  │  │  padding-top: var(--safe-top)                                │    │  │
 * │  │  │  padding-left: var(--safe-left)                              │    │  │
 * │  │  │  padding-right: var(--safe-right)                            │    │  │
 * │  │  │  Page content scrolls here                                   │    │  │
 * │  │  │  padding-bottom accounts for nav + safe-bottom               │    │  │
 * │  │  └──────────────────────────────────────────────────────────────┘    │  │
 * │  │  ┌─── BottomNav (absolute bottom:0, w-full) ───────────────────┐    │  │
 * │  │  │  padding-bottom: var(--safe-bottom)                         │    │  │
 * │  │  └─────────────────────────────────────────────────────────────┘    │  │
 * │  └─────────────────────────────────────────────────────────────────────┘  │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * Key rules:
 * - NO position:fixed anywhere
 * - NO 100vh
 * - NO JS keyboard detection
 * - Safe areas injected by Flutter via CSS variables
 */
const AppShell = ({ children, hideNav }: AppShellProps) => {
  return (
    <div className="relative flex flex-col flex-1 overflow-hidden">
      {/* Background layer */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <GenderBackground />
      </div>

      {/* Scrollable content area */}
      <main
        id="main-content"
        className="flex-1 overflow-y-auto overflow-x-hidden overscroll-none"
        style={{
          paddingTop: 'var(--safe-top)',
          paddingLeft: 'var(--safe-left)',
          paddingRight: 'var(--safe-right)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className="max-w-7xl mx-auto md:px-8">
          {children}
        </div>
      </main>

      {/* Bottom navigation — absolute, not fixed */}
      {!hideNav && (
        <div className="absolute bottom-0 left-0 right-0 z-50">
          <BottomNav />
          <CartPill />
        </div>
      )}
    </div>
  );
};

export default AppShell;
