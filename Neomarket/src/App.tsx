import React, { useState, useEffect, Suspense } from 'react';
import { ThirdwebProvider } from "thirdweb/react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { client } from './client';

import MainLayout from './components/Layout/MainLayout';
import LogoIntro from './components/Layout/LogoIntro';
import LoadingScreen from './components/LoadingScreen';
import InactivityManager from './components/InactivityManager';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy-loaded pages
const ExplorePage = React.lazy(() => import('./components/Explore/ExplorePage'));
const CollectionsPage = React.lazy(() => import('./components/Collections/CollectionsPage'));
const ScavenjersCollectionPage = React.lazy(() => import('./components/Collections/ScavenjersCollectionPage'));
const ExchangePage = React.lazy(() => import('./components/Exchange/ExchangePage'));
const DarkCircuitPage = React.lazy(() => import('./components/DarkCircuit/DarkCircuitPage'));
const ActivityPage = React.lazy(() => import('./components/ActivityPage'));
const PrivacyPolicyPage = React.lazy(() => import('./components/PrivacyPolicyPage'));
const TermsPage = React.lazy(() => import('./components/TermsPage'));
const NeoMarketPage = React.lazy(() => import('./components/NeoMarketPage'));
const NotFoundPage = React.lazy(() => import('./components/NotFoundPage'));


function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  const [showLogoIntro, setShowLogoIntro] = useState(true);
  const [introComplete, setIntroComplete] = useState(false);

  const handleIntroComplete = () => {
    setIntroComplete(true);
    setTimeout(() => {
      setShowLogoIntro(false);
    }, 100); // Small delay to ensure smooth transition
  };

  return (
    <ErrorBoundary>
      <ThirdwebProvider>
        <Router>
          <InactivityManager />
          <ScrollToTop />
          <Analytics />
          <SpeedInsights />
          
          {/* Logo Intro Animation */}
          {showLogoIntro && (
            <LogoIntro onComplete={handleIntroComplete} />
          )}
          
          {/* Main Application */}
          <div className="min-h-screen bg-[#0A0A0A] text-white">
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Navigate to="/explore" replace />} />
                  <Route path="explore" element={<ExplorePage />} />
                  <Route path="collections" element={<CollectionsPage />} />
                  <Route path="collection" element={<Navigate to="/collection/scavenjers" replace />} />
                  <Route path="collection/scavenjers" element={<ScavenjersCollectionPage />} />
                  <Route path="exchange" element={<ExchangePage />} />
                  <Route path="activity" element={<ActivityPage />} />
                  <Route path="neomarket" element={<NeoMarketPage />} />
                  <Route path="marketplace" element={<Navigate to="/collections" replace />} />
                  <Route path="dark-circuit" element={<DarkCircuitPage />} />
                  <Route path="privacy" element={<PrivacyPolicyPage />} />
                  <Route path="terms" element={<TermsPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </Suspense>
          </div>
        </Router>
      </ThirdwebProvider>
    </ErrorBoundary>
  );
}

export default App;