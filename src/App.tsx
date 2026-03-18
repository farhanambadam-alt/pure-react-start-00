import { Suspense, lazy, useMemo } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { GenderProvider } from "@/contexts/GenderContext";
import { CartProvider } from "@/contexts/CartContext";
import AppShell from "@/components/AppShell";
import SalonSwitchModal from "@/components/SalonSwitchModal";

/* Route-level code splitting */
const Index = lazy(() => import("./pages/Index"));
const SalonDetail = lazy(() => import("./pages/SalonDetail"));
const BookingFlow = lazy(() => import("./pages/BookingFlow"));
const Bookings = lazy(() => import("./pages/Bookings"));
const Offers = lazy(() => import("./pages/Offers"));
const Explore = lazy(() => import("./pages/Explore"));
const Profile = lazy(() => import("./pages/Profile"));
const AtHome = lazy(() => import("./pages/AtHome"));
const ArtistProfile = lazy(() => import("./pages/ArtistProfile"));
const AtHomeBooking = lazy(() => import("./pages/AtHomeBooking"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

/** Routes that should hide the bottom nav */
const HIDE_NAV_PREFIXES = ['/salon/', '/booking/', '/artist/', '/at-home-booking/'];

const AppContent = () => {
  const location = useLocation();
  const hideNav = useMemo(
    () => HIDE_NAV_PREFIXES.some((p) => location.pathname.startsWith(p)),
    [location.pathname],
  );

  return (
    <AppShell hideNav={hideNav}>
      <Suspense fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-[3px] border-muted-foreground/20 border-t-primary rounded-full animate-spin" />
            <span className="text-xs text-muted-foreground font-body">Loading…</span>
          </div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/salon/:id" element={<SalonDetail />} />
          <Route path="/booking/:id" element={<BookingFlow />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/at-home" element={<AtHome />} />
          <Route path="/artist/:id" element={<ArtistProfile />} />
          <Route path="/at-home-booking/:id" element={<AtHomeBooking />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <GenderProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
            <SalonSwitchModal />
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </GenderProvider>
  </QueryClientProvider>
);

export default App;
