import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'react-query';
import { 
  Globe, MapPin, Search, Filter, ArrowRight, Star, 
  Eye, Camera, Headphones, Navigation, Users, Clock,
  Thermometer, Wind, Mountain, Waves, TreePine, Building,
  Plane, Car, Train, Ship, Compass, Zap, Wifi, Shield
} from 'lucide-react';
import { countriesApi, citiesApi } from '../services/apiServices';
import InteractiveButton from '../components/UI/InteractiveButton';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Notification from '../components/UI/Notification';

interface ExploreCategory {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  link: string;
  features: string[];
}

const ExplorePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');

  // Fetch popular destinations
  const { data: popularCities, isLoading: citiesLoading, error: citiesError } = useQuery(
    'popularCities',
    citiesApi.getPopular,
    {
      staleTime: 30 * 60 * 1000, // 30 minutes
      onError: () => {
        setShowNotification(true);
      }
    }
  );

  // Fetch countries
  const { data: countries, isLoading: countriesLoading } = useQuery(
    'countries',
    countriesApi.getAll,
    {
      staleTime: 60 * 60 * 1000, // 1 hour
    }
  );

  const exploreCategories: ExploreCategory[] = [
    {
      id: 'world-explorer',
      title: 'Ultra World Explorer',
      description: 'Experience our most advanced global exploration tool with real-time data',
      icon: Globe,
      color: 'from-blue-500 to-blue-600',
      link: '/world-explorer',
      features: ['Real-time global statistics', '360° immersive views', 'Live weather data', 'Cultural events']
    },
    {
      id: 'location-explorer',
      title: 'Location Explorer',
      description: 'Deep dive into specific destinations with comprehensive details',
      icon: MapPin,
      color: 'from-green-500 to-green-600',
      link: '/location-explorer',
      features: ['Detailed location info', 'Transport systems', 'Local amenities', 'Street-level views']
    },
    {
      id: 'virtual-tours',
      title: 'Virtual Tours',
      description: 'Take guided tours of world-famous landmarks and hidden gems',
      icon: Camera,
      color: 'from-purple-500 to-purple-600',
      link: '/tours',
      features: ['Guided experiences', 'Historical insights', 'Interactive elements', 'Audio commentary']
    },
    {
      id: 'cultural-immersion',
      title: 'Cultural Immersion',
      description: 'Immerse yourself in local cultures, sounds, and experiences',
      icon: Headphones,
      color: 'from-orange-500 to-orange-600',
      link: '/culture',
      features: ['Local radio stations', 'Ambient sounds', 'Cultural events', 'Language experiences']
    },
    {
      id: 'transport-simulation',
      title: 'Transport Modes',
      description: 'Experience different ways to travel and explore destinations',
      icon: Navigation,
      color: 'from-indigo-500 to-indigo-600',
      link: '/transport',
      features: ['Walking tours', 'Cycling routes', 'Driving simulation', 'Public transport']
    },
    {
      id: 'live-experiences',
      title: 'Live Experiences',
      description: 'Real-time experiences with live data and current conditions',
      icon: Zap,
      color: 'from-red-500 to-red-600',
      link: '/live',
      features: ['Live weather', 'Current events', 'Real-time traffic', 'Active webcams']
    }
  ];

  const filteredCategories = exploreCategories.filter(category =>
    selectedCategory ? category.id === selectedCategory : true
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient">
              Explore the World
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover amazing destinations with ultra-immersive virtual experiences. 
              Travel anywhere, anytime, with our cutting-edge exploration tools.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for destinations, countries, or experiences..."
                  className="w-full pl-12 pr-16 py-4 bg-white/80 backdrop-blur-md border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
                <InteractiveButton
                  variant="primary"
                  size="md"
                  className="absolute right-2 top-2"
                  onClick={() => {
                    if (searchQuery.trim()) {
                      // Implement search functionality
                      console.log('Searching for:', searchQuery);
                    }
                  }}
                >
                  Search
                </InteractiveButton>
              </div>
            </div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              <div className="glass-card p-4 text-center">
                <MapPin className="mx-auto mb-2 text-blue-500" size={24} />
                <div className="text-2xl font-bold text-gray-900">195</div>
                <div className="text-sm text-gray-600">Countries</div>
              </div>
              <div className="glass-card p-4 text-center">
                <Building className="mx-auto mb-2 text-green-500" size={24} />
                <div className="text-2xl font-bold text-gray-900">10,000+</div>
                <div className="text-sm text-gray-600">Cities</div>
              </div>
              <div className="glass-card p-4 text-center">
                <Camera className="mx-auto mb-2 text-purple-500" size={24} />
                <div className="text-2xl font-bold text-gray-900">50,000+</div>
                <div className="text-sm text-gray-600">Locations</div>
              </div>
              <div className="glass-card p-4 text-center">
                <Users className="mx-auto mb-2 text-orange-500" size={24} />
                <div className="text-2xl font-bold text-gray-900">1M+</div>
                <div className="text-sm text-gray-600">Experiences</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Exploration Categories */}
      <section className="pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-gradient">
              Choose Your Adventure
            </h2>
            <p className="text-xl text-gray-600">
              Select from our world-class exploration tools and experiences
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group"
                >
                  <Link to={category.link} className="block">
                    <div className="travel-card h-full relative overflow-hidden group-hover:shadow-2xl">
                      {/* Background Gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                      
                      {/* Content */}
                      <div className="relative z-10">
                        {/* Icon */}
                        <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${category.color} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                          <Icon size={32} />
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                          {category.title}
                        </h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                          {category.description}
                        </p>

                        {/* Features */}
                        <div className="space-y-2 mb-6">
                          {category.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center text-sm text-gray-500">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                              {feature}
                            </div>
                          ))}
                        </div>

                        {/* CTA */}
                        <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700 transition-colors duration-300">
                          <span>Start Exploring</span>
                          <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="pb-16 px-6 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-gradient">
              Popular Destinations
            </h2>
            <p className="text-xl text-gray-600">
              Start with these trending virtual travel experiences
            </p>
          </motion.div>

          {citiesLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="large" text="Loading destinations..." />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Fallback popular destinations if API fails */}
              {['Paris, France', 'Tokyo, Japan', 'New York, USA', 'London, UK', 'Rome, Italy', 'Sydney, Australia', 'Dubai, UAE', 'Barcelona, Spain'].map((destination, index) => (
                <motion.div
                  key={destination}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link to={`/location-explorer?q=${encodeURIComponent(destination)}`} className="block travel-card group">
                    <div className="aspect-square bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mb-4 relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        <MapPin size={48} className="group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <div className="text-lg font-semibold">{destination.split(',')[0]}</div>
                        <div className="text-sm opacity-90">{destination.split(',')[1]}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">360° Available</span>
                      <Star className="text-yellow-500 fill-current" size={16} />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Ready for the Ultimate Virtual Adventure?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Experience the world like never before with our cutting-edge virtual travel platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <InteractiveButton
                variant="secondary"
                size="lg"
                icon={Globe}
                onClick={() => window.location.href = '/world-explorer'}
              >
                Start World Explorer
              </InteractiveButton>
              <InteractiveButton
                variant="ghost"
                size="lg"
                icon={MapPin}
                className="text-white border-white hover:bg-white/10"
                onClick={() => window.location.href = '/location-explorer'}
              >
                Explore Locations
              </InteractiveButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Notification */}
      {showNotification && (
        <Notification
          type="info"
          title="Demo Mode"
          message="Some features are running in demo mode. Full functionality available in production."
          onClose={() => setShowNotification(false)}
        />
      )}
    </div>
  );
};

export default ExplorePage;
