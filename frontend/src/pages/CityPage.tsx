import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from 'react-query'
import {
  MapPin,
  Cloud,
  Thermometer,
  Wind,
  Camera,
  Headphones,
  Navigation,
  Star,
  ArrowLeft,
  Share2,
  Heart,
  Globe,
  Clock,
  Users,
  Building,
  TreePine,
  Waves,
  Mountain,
  Search,
  Filter
} from 'lucide-react'
import { citiesApi, weatherApi } from '../services/apiServices'
import { designSystem } from '../config/designSystem'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import InteractiveButton from '../components/UI/InteractiveButton'

interface CityDetails {
  id: string
  name: string
  country: string
  latitude: number
  longitude: number
  population: number
  description: string
  timezone: string
  highlights: string[]
  attractions: string[]
  bestTimeToVisit: string
}

interface WeatherData {
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  feelsLike: number
}

const CityPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [isFavorited, setIsFavorited] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'attractions' | 'weather' | 'culture'>('overview')

  // Mock city data
  const [cityData] = useState<CityDetails>({
    id: id || '1',
    name: 'Paris',
    country: 'France',
    latitude: 48.8566,
    longitude: 2.3522,
    population: 2_161_000,
    description: 'The City of Light is the capital and most populous city of France. Known for its iconic landmarks, world-class museums, and romantic atmosphere.',
    timezone: 'Europe/Paris',
    highlights: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame Cathedral', 'Arc de Triomphe', 'Sacré-Cœur'],
    attractions: ['Seine River Cruise', 'Versailles Palace', 'Musée d\'Orsay', 'Champs-Élysées', 'Latin Quarter'],
    bestTimeToVisit: 'April-June, September-October'
  })

  // Mock weather data
  const [weatherData] = useState<WeatherData>({
    temperature: 18,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12,
    feelsLike: 16
  })

  const fadeInUp = {
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.8 },
    viewport: { once: true }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Navigation Bar */}
      <div className={`bg-white shadow-sm sticky top-0 z-50`}>
        <div className={`${designSystem.layout.sectionPadding} ${designSystem.layout.containerMaxWidth} mx-auto flex items-center justify-between`}>
          <Link to="/explore" className="flex items-center text-blue-600 hover:text-blue-700 transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            Back to Explore
          </Link>
          <div className="flex items-center gap-3">
            <InteractiveButton
              variant="ghost"
              size="sm"
              icon={Share2}
              onClick={() => alert('Share feature coming soon')}
            >
              Share
            </InteractiveButton>
            <InteractiveButton
              variant="ghost"
              size="sm"
              icon={Heart}
              onClick={() => setIsFavorited(!isFavorited)}
              className={isFavorited ? 'text-red-500' : 'text-gray-600'}
            >
              {isFavorited ? 'Favorited' : 'Favorite'}
            </InteractiveButton>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className={`${designSystem.layout.sectionWithPadding} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
        <motion.div
          {...fadeInUp}
          className="relative z-10"
        >
          <div className="mb-6 inline-flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full">
            <MapPin size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">{cityData.country}</span>
          </div>

          <h1 className={`${designSystem.typography.h1Large} mb-4 text-gradient`}>
            {cityData.name}
          </h1>

          <p className={`${designSystem.typography.subtitle} mb-8 max-w-2xl`}>
            {cityData.description}
          </p>

          {/* Key Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="travel-card p-6">
              <div className="flex items-center mb-2">
                <Users size={20} className="text-blue-500 mr-2" />
                <span className="text-sm text-gray-600">Population</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {(cityData.population / 1_000_000).toFixed(1)}M
              </div>
            </div>

            <div className="travel-card p-6">
              <div className="flex items-center mb-2">
                <Clock size={20} className="text-green-500 mr-2" />
                <span className="text-sm text-gray-600">Timezone</span>
              </div>
              <div className="text-lg font-bold text-gray-900">
                {cityData.timezone}
              </div>
            </div>

            <div className="travel-card p-6">
              <div className="flex items-center mb-2">
                <Thermometer size={20} className="text-red-500 mr-2" />
                <span className="text-sm text-gray-600">Temperature</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {weatherData.temperature}°C
              </div>
            </div>

            <div className="travel-card p-6">
              <div className="flex items-center mb-2">
                <Cloud size={20} className="text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">Weather</span>
              </div>
              <div className="text-lg font-bold text-gray-900">
                {weatherData.condition}
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <InteractiveButton
              variant="primary"
              size="lg"
              icon={Camera}
              onClick={() => alert('360° view launching...')}
              className="text-lg"
            >
              View 360°
            </InteractiveButton>
            <InteractiveButton
              variant="ghost"
              size="lg"
              icon={Navigation}
              onClick={() => alert('Navigation mode starting...')}
              className="text-lg border-2"
            >
              Start Navigation
            </InteractiveButton>
          </div>
        </motion.div>
      </section>

      {/* Tabs Navigation */}
      <section className="sticky top-16 z-40 bg-white border-b border-gray-200">
        <div className={`${designSystem.layout.containerMaxWidth} mx-auto ${designSystem.layout.contentPadding}`}>
          <div className="flex space-x-8 overflow-x-auto">
            {(['overview', 'attractions', 'weather', 'culture'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className={`${designSystem.layout.sectionWithPadding}`}>
        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <h2 className={designSystem.typography.h2 + ' mb-6'}>About {cityData.name}</h2>
                  <p className={`${designSystem.typography.body.lg} text-gray-600 mb-6`}>
                    Explore the heart of {cityData.country} and discover why {cityData.name} is one of the world's most visited cities.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Globe size={20} className="text-blue-500 mr-3 mt-1" />
                      <div>
                        <div className="font-semibold text-gray-900">Best Time to Visit</div>
                        <div className="text-gray-600">{cityData.bestTimeToVisit}</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Building size={20} className="text-green-500 mr-3 mt-1" />
                      <div>
                        <div className="font-semibold text-gray-900">Main Attractions</div>
                        <div className="text-gray-600">{cityData.highlights.join(', ')}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="travel-card p-8 h-fit">
                  <h3 className={designSystem.typography.h3 + ' mb-6'}>Key Highlights</h3>
                  <div className="space-y-4">
                    {cityData.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center pb-4 border-b border-gray-200 last:border-0">
                        <Star className="text-yellow-500 mr-3 flex-shrink-0" size={20} />
                        <span className="font-semibold text-gray-900">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Attractions Tab */}
          {activeTab === 'attractions' && (
            <motion.div
              key="attractions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className={designSystem.typography.h2 + ' mb-12'}>Must-See Attractions</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cityData.attractions.map((attraction, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="travel-card p-8 group"
                  >
                    <Camera size={32} className="text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{attraction}</h3>
                    <p className="text-gray-600 mb-4">Explore this iconic location with 360° views and augmented reality features.</p>
                    <InteractiveButton
                      variant="primary"
                      size="sm"
                      onClick={() => alert(`Launching ${attraction}...`)}
                    >
                      Explore
                    </InteractiveButton>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Weather Tab */}
          {activeTab === 'weather' && (
            <motion.div
              key="weather"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className={designSystem.typography.h2 + ' mb-12'}>Weather & Conditions</h2>
              <div className="grid md:grid-cols-2 gap-12">
                <div className="travel-card p-8">
                  <h3 className={designSystem.typography.h3 + ' mb-8'}>Current Weather</h3>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center pb-6 border-b border-gray-200">
                      <span className="text-lg text-gray-600">Temperature</span>
                      <span className="text-3xl font-bold text-gray-900">{weatherData.temperature}°C</span>
                    </div>
                    <div className="flex justify-between items-center pb-6 border-b border-gray-200">
                      <span className="text-lg text-gray-600">Feels Like</span>
                      <span className="text-2xl font-bold text-gray-900">{weatherData.feelsLike}°C</span>
                    </div>
                    <div className="flex justify-between items-center pb-6 border-b border-gray-200">
                      <span className="text-lg text-gray-600">Humidity</span>
                      <span className="text-2xl font-bold text-gray-900">{weatherData.humidity}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg text-gray-600">Wind Speed</span>
                      <span className="text-2xl font-bold text-gray-900">{weatherData.windSpeed} km/h</span>
                    </div>
                  </div>
                </div>

                <div className="travel-card p-8">
                  <h3 className={designSystem.typography.h3 + ' mb-8'}>Travel Tips</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Cloud size={24} className="text-blue-500 mr-4 mt-1" />
                      <div>
                        <div className="font-semibold text-gray-900">Best for Photography</div>
                        <div className="text-sm text-gray-600">Golden hour during sunset provides ideal lighting</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Wind size={24} className="text-green-500 mr-4 mt-1" />
                      <div>
                        <div className="font-semibold text-gray-900">Comfortable Exploration</div>
                        <div className="text-sm text-gray-600">Mild conditions ideal for extended virtual tours</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Mountain size={24} className="text-purple-500 mr-4 mt-1" />
                      <div>
                        <div className="font-semibold text-gray-900">Visibility</div>
                        <div className="text-sm text-gray-600">Clear skies perfect for long-distance viewing</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Culture Tab */}
          {activeTab === 'culture' && (
            <motion.div
              key="culture"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className={designSystem.typography.h2 + ' mb-12'}>Culture & Local Experiences</h2>
              <div className="grid md:grid-cols-2 gap-12">
                <div className="travel-card p-8">
                  <Headphones size={32} className="text-orange-500 mb-4" />
                  <h3 className={designSystem.typography.h3 + ' mb-4'}>Local Radio</h3>
                  <p className="text-gray-600 mb-6">Listen to local radio stations and get a feel for the city's vibe and music scene.</p>
                  <InteractiveButton
                    variant="primary"
                    size="sm"
                  >
                    Tune In
                  </InteractiveButton>
                </div>

                <div className="travel-card p-8">
                  <Waves size={32} className="text-blue-500 mb-4" />
                  <h3 className={designSystem.typography.h3 + ' mb-4'}>Ambient Sounds</h3>
                  <p className="text-gray-600 mb-6">Experience the authentic sounds of the city streets, cafés, and parks.</p>
                  <InteractiveButton
                    variant="primary"
                    size="sm"
                  >
                    Listen
                  </InteractiveButton>
                </div>

                <div className="travel-card p-8">
                  <Building size={32} className="text-green-500 mb-4" />
                  <h3 className={designSystem.typography.h3 + ' mb-4'}>Architecture</h3>
                  <p className="text-gray-600 mb-6">Discover the city's architectural heritage and modern landmarks.</p>
                  <InteractiveButton
                    variant="primary"
                    size="sm"
                  >
                    Explore
                  </InteractiveButton>
                </div>

                <div className="travel-card p-8">
                  <TreePine size={32} className="text-green-600 mb-4" />
                  <h3 className={designSystem.typography.h3 + ' mb-4'}>Parks & Green Spaces</h3>
                  <p className="text-gray-600 mb-6">Find peaceful green spaces perfect for relaxation and nature exploration.</p>
                  <InteractiveButton
                    variant="primary"
                    size="sm"
                  >
                    Discover
                  </InteractiveButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Related Cities */}
      <section className="bg-gray-50">
        <div className={`${designSystem.layout.sectionWithPadding}`}>
          <motion.div
            {...fadeInUp}
            className="text-center mb-12"
          >
            <h2 className={designSystem.typography.h2 + ' mb-4 text-gradient'}>
              Explore Nearby Cities
            </h2>
            <p className={`${designSystem.typography.subtitle}`}>
              Discover other amazing destinations in the region
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {['Lyon', 'Marseille', 'Amsterdam'].map((city, idx) => (
              <motion.div
                key={city}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Link to={`/city/${city.toLowerCase()}`} className="travel-card group">
                  <div className="aspect-square bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <MapPin size={48} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{city}</h3>
                  <p className="text-sm text-gray-600">Discover this amazing destination</p>
                  <div className="mt-4 text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                    Explore →
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

// Import AnimatePresence at top
import { AnimatePresence } from 'framer-motion'

export default CityPage
