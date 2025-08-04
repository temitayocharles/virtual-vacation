import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navigation from './components/Navigation/Navigation'
import LoadingSpinner from './components/UI/LoadingSpinner'
import { useVacationStore } from './store/vacationStore'

// Lazy load components for better performance
const HomePage = React.lazy(() => import('./pages/HomePage'))
const ExplorePage = React.lazy(() => import('./pages/ExplorePage'))
const CountryPage = React.lazy(() => import('./pages/CountryPage'))
const CityPage = React.lazy(() => import('./pages/CityPage'))
const ImmersiveView = React.lazy(() => import('./pages/ImmersiveView'))
const FavoritesPage = React.lazy(() => import('./pages/FavoritesPage'))
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'))

// Ultra-comprehensive world exploration components
const UltraImmersiveWorldExplorer = React.lazy(() => import('./components/UltraImmersiveWorldExplorer'))
const ComprehensiveLocationExplorer = React.lazy(() => import('./components/ComprehensiveLocationExplorer'))
const AdvancedVirtualTour = React.lazy(() => import('./components/AdvancedVirtualTour'))
const CountryExplorer = React.lazy(() => import('./components/CountryExplorer'))

function App() {
  const { isLoading } = useVacationStore()

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="immersive-overlay"
        >
          <div className="glass-card p-8 text-center">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-lg glowing-text">Loading your virtual vacation...</p>
          </div>
        </motion.div>
      )}

      <main className="pt-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="glass-card p-8 text-center">
                <LoadingSpinner size="large" />
                <p className="mt-4 text-lg glowing-text">Preparing your experience...</p>
              </div>
            </div>
          }>
            <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/countries" element={<CountryExplorer />} />
            <Route path="/country/:countryCode" element={<CountryPage />} />
            <Route path="/city/:cityId" element={<CityPage />} />
            <Route path="/immersive/:locationId" element={<ImmersiveView />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            
            {/* Ultra-comprehensive world exploration routes */}
            <Route path="/world-explorer" element={<UltraImmersiveWorldExplorer />} />
            <Route path="/location-explorer" element={<ComprehensiveLocationExplorer />} />
          </Routes>
        </Suspense>
        </motion.div>
      </main>
    </div>
  )
}

export default App
