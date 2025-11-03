import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Globe,
  Users,
  DollarSign,
  Languages,
  Flag,
  ArrowLeft,
  Search,
  Filter,
  Star,
  Camera,
  Headphones,
  TrendingUp,
  Building,
  Mountain,
  Waves,
  TreePine
} from 'lucide-react'
import { designSystem } from '../config/designSystem'
import InteractiveButton from '../components/UI/InteractiveButton'
import LoadingSpinner from '../components/UI/LoadingSpinner'

interface CountryInfo {
  id: string
  name: string
  capital: string
  population: number
  area: number
  continents: string[]
  languages: string[]
  currency: string
  timezone: string
  highlights: string[]
  description: string
}

const CountryPage: React.FC = () => {
  const { code } = useParams<{ code: string }>()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'cities' | 'culture' | 'attractions'>('overview')

  // Mock country data
  const [countryData] = useState<CountryInfo>({
    id: code || 'FR',
    name: 'France',
    capital: 'Paris',
    population: 67_970_000,
    area: 643_801,
    continents: ['Europe'],
    languages: ['French'],
    currency: 'EUR',
    timezone: 'CET',
    highlights: ['French Cuisine', 'World-Class Wine', 'Art & Culture', 'Iconic Landmarks'],
    description: 'France is a Western European country with thousands of years of history. From the Eiffel Tower in Paris to the lavender fields of Provence, France offers diverse landscapes and rich cultural experiences.'
  })

  // Mock cities data
  const [cities] = useState([
    { name: 'Paris', population: '2.16M', description: 'The City of Light' },
    { name: 'Marseille', population: '869K', description: 'Mediterranean Port' },
    { name: 'Lyon', population: '513K', description: 'Renaissance City' },
    { name: 'Toulouse', population: '479K', description: 'Pink City' },
    { name: 'Nice', population: '340K', description: 'Azure Coast' },
    { name: 'Bordeaux', population: '262K', description: 'Wine Capital' }
  ])

  const fadeInUp = {
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.8 },
    viewport: { once: true }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Navigation Bar */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className={`${designSystem.layout.sectionPadding} ${designSystem.layout.containerMaxWidth} mx-auto flex items-center justify-between`}>
          <Link to="/explore" className="flex items-center text-blue-600 hover:text-blue-700 transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{countryData.name}</h1>
          <div className="w-8" />
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
            <Flag size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">{countryData.continents.join(', ')}</span>
          </div>

          <h1 className={`${designSystem.typography.h1Large} mb-4 text-gradient`}>
            Welcome to {countryData.name}
          </h1>

          <p className={`${designSystem.typography.subtitle} mb-8 max-w-3xl`}>
            {countryData.description}
          </p>

          {/* Key Stats */}
          <div className="grid md:grid-cols-5 gap-4 mb-8">
            <div className="travel-card p-6 text-center">
              <Users size={24} className="text-blue-500 mx-auto mb-2" />
              <div className="text-sm text-gray-600 mb-1">Population</div>
              <div className="text-2xl font-bold text-gray-900">
                {(countryData.population / 1_000_000).toFixed(1)}M
              </div>
            </div>

            <div className="travel-card p-6 text-center">
              <MapPin size={24} className="text-green-500 mx-auto mb-2" />
              <div className="text-sm text-gray-600 mb-1">Area</div>
              <div className="text-2xl font-bold text-gray-900">
                {(countryData.area / 1000).toFixed(0)}K km²
              </div>
            </div>

            <div className="travel-card p-6 text-center">
              <Globe size={24} className="text-purple-500 mx-auto mb-2" />
              <div className="text-sm text-gray-600 mb-1">Capital</div>
              <div className="text-lg font-bold text-gray-900">
                {countryData.capital}
              </div>
            </div>

            <div className="travel-card p-6 text-center">
              <Languages size={24} className="text-orange-500 mx-auto mb-2" />
              <div className="text-sm text-gray-600 mb-1">Language</div>
              <div className="text-lg font-bold text-gray-900">
                {countryData.languages[0]}
              </div>
            </div>

            <div className="travel-card p-6 text-center">
              <DollarSign size={24} className="text-green-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600 mb-1">Currency</div>
              <div className="text-lg font-bold text-gray-900">
                {countryData.currency}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4">
            <InteractiveButton
              variant="primary"
              size="lg"
              icon={Camera}
              onClick={() => alert('Virtual tour starting...')}
              className="text-lg"
            >
              Start Virtual Tour
            </InteractiveButton>
            <InteractiveButton
              variant="ghost"
              size="lg"
              icon={MapPin}
              onClick={() => setActiveTab('cities')}
              className="text-lg border-2"
            >
              Explore Cities
            </InteractiveButton>
          </div>
        </motion.div>
      </section>

      {/* Tabs Navigation */}
      <section className="sticky top-16 z-40 bg-white border-b border-gray-200">
        <div className={`${designSystem.layout.containerMaxWidth} mx-auto ${designSystem.layout.contentPadding}`}>
          <div className="flex space-x-8 overflow-x-auto">
            {(['overview', 'cities', 'culture', 'attractions'] as const).map((tab) => (
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
                  <h2 className={designSystem.typography.h2 + ' mb-6'}>About {countryData.name}</h2>
                  <p className={`${designSystem.typography.body.lg} text-gray-600 mb-6 leading-relaxed`}>
                    {countryData.description}
                  </p>

                  <h3 className={designSystem.typography.h3 + ' mb-4'}>Why Visit?</h3>
                  <div className="space-y-3">
                    {countryData.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center">
                        <Star className="text-yellow-500 fill-current mr-3 flex-shrink-0" size={20} />
                        <span className="text-gray-900 font-medium">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="travel-card p-8 mb-6">
                    <h3 className={designSystem.typography.h3 + ' mb-6'}>Quick Facts</h3>
                    <div className="space-y-4">
                      <div className="pb-4 border-b border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">Official Name</div>
                        <div className="font-semibold text-gray-900">French Republic</div>
                      </div>
                      <div className="pb-4 border-b border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">UN Member Since</div>
                        <div className="font-semibold text-gray-900">1945</div>
                      </div>
                      <div className="pb-4 border-b border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">GDP per Capita</div>
                        <div className="font-semibold text-gray-900">~€42,000</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Tourism Rank</div>
                        <div className="font-semibold text-gray-900">#1 Globally</div>
                      </div>
                    </div>
                  </div>

                  <div className="travel-card p-8 bg-gradient-to-br from-blue-50 to-purple-50">
                    <h3 className={designSystem.typography.h3 + ' mb-4'}>Best Time to Visit</h3>
                    <p className="text-gray-600 mb-4">
                      April to June and September to October offer pleasant weather and fewer crowds.
                    </p>
                    <div className="flex items-center text-blue-600 font-semibold">
                      <TrendingUp size={20} className="mr-2" />
                      Peak Season: July-August
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Cities Tab */}
          {activeTab === 'cities' && (
            <motion.div
              key="cities"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className={designSystem.typography.h2 + ' mb-12 text-center'}>Major Cities</h2>
              
              {/* Search & Filter */}
              <div className="mb-12">
                <div className="relative max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search cities..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cities
                  .filter(city =>
                    city.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((city, idx) => (
                    <motion.div
                      key={city.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Link to={`/city/${city.name.toLowerCase()}`} className="travel-card group">
                        <div className="aspect-square bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mb-4 flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
                          <MapPin size={48} className="text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{city.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{city.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-blue-600">Population: {city.population}</span>
                          <Star className="text-yellow-500 fill-current" size={16} />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
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
              <h2 className={designSystem.typography.h2 + ' mb-12'}>Culture & Heritage</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="travel-card p-8">
                  <Building size={32} className="text-blue-500 mb-4" />
                  <h3 className={designSystem.typography.h3 + ' mb-4'}>Architecture</h3>
                  <p className="text-gray-600 mb-6">
                    From Gothic cathedrals to modernist masterpieces, explore centuries of architectural excellence.
                  </p>
                  <InteractiveButton variant="primary" size="sm">Explore</InteractiveButton>
                </div>

                <div className="travel-card p-8">
                  <Headphones size={32} className="text-green-500 mb-4" />
                  <h3 className={designSystem.typography.h3 + ' mb-4'}>Music & Arts</h3>
                  <p className="text-gray-600 mb-6">
                    Experience world-renowned museums, galleries, and performance venues throughout the country.
                  </p>
                  <InteractiveButton variant="primary" size="sm">Discover</InteractiveButton>
                </div>

                <div className="travel-card p-8">
                  <Mountain size={32} className="text-purple-500 mb-4" />
                  <h3 className={designSystem.typography.h3 + ' mb-4'}>Landmarks</h3>
                  <p className="text-gray-600 mb-6">
                    Visit iconic landmarks that have shaped history, from Versailles to Mont Saint-Michel.
                  </p>
                  <InteractiveButton variant="primary" size="sm">Explore</InteractiveButton>
                </div>

                <div className="travel-card p-8">
                  <Waves size={32} className="text-blue-600 mb-4" />
                  <h3 className={designSystem.typography.h3 + ' mb-4'}>Natural Wonders</h3>
                  <p className="text-gray-600 mb-6">
                    From alpine peaks to Mediterranean coastlines, discover diverse natural landscapes.
                  </p>
                  <InteractiveButton variant="primary" size="sm">Discover</InteractiveButton>
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
              <h2 className={designSystem.typography.h2 + ' mb-12'}>Top Attractions</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {[
                  { name: 'Eiffel Tower', city: 'Paris', description: 'Iconic iron lattice tower, symbol of France' },
                  { name: 'Louvre Museum', city: 'Paris', description: 'World\'s largest art museum' },
                  { name: 'Versailles Palace', city: 'Versailles', description: 'Former royal residence with stunning gardens' },
                  { name: 'Mont Saint-Michel', city: 'Normandy', description: 'Medieval abbey on a tidal island' },
                  { name: 'Provence Lavender Fields', city: 'Provence', description: 'Rolling purple fields in summer' },
                  { name: 'French Riviera', city: 'Côte d\'Azur', description: 'Glamorous Mediterranean coastline' }
                ].map((attraction, idx) => (
                  <motion.div
                    key={attraction.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="travel-card p-8 group"
                  >
                    <Camera size={32} className="text-orange-500 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{attraction.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{attraction.city}</p>
                    <p className="text-gray-600 mb-6">{attraction.description}</p>
                    <InteractiveButton
                      variant="primary"
                      size="sm"
                      onClick={() => alert(`Launching ${attraction.name}...`)}
                    >
                      View
                    </InteractiveButton>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Related Countries */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50">
        <div className={`${designSystem.layout.sectionWithPadding}`}>
          <motion.div
            {...fadeInUp}
            className="text-center mb-12"
          >
            <h2 className={designSystem.typography.h2 + ' mb-4 text-gradient'}>
              Explore Neighboring Countries
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {['Germany', 'Italy', 'Spain', 'Switzerland'].map((country, idx) => (
              <motion.div
                key={country}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Link to={`/country/${country.slice(0, 2).toUpperCase()}`} className="travel-card group h-full">
                  <div className="aspect-square bg-gradient-to-br from-green-400 to-blue-500 rounded-lg mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Globe size={40} className="text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900">{country}</h3>
                  <div className="mt-2 text-blue-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
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

export default CountryPage
