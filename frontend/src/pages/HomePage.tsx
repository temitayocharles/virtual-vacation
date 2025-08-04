import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useQuery } from 'react-query'
import { 
  Globe, 
  MapPin, 
  Camera, 
  Headphones, 
  Navigation as NavigationIcon,
  ArrowRight,
  Star,
  TrendingUp,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Users,
  Clock,
  Zap,
  Shield,
  Award,
  Sparkles,
  Eye,
  Compass
} from 'lucide-react'
import { countriesApi, citiesApi } from '../services/apiServices'
import { useVacationStore } from '../store/vacationStore'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import InteractiveButton from '../components/UI/InteractiveButton'
import CountryExplorer from '../components/CountryExplorer'

const HomePage: React.FC = () => {
  const { setCountries, recentlyVisited, favorites } = useVacationStore()
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)
  const { scrollY } = useScroll()
  const yRange = useTransform(scrollY, [0, 500], [0, -150])

  // Fetch popular destinations
  const { data: popularCities, isLoading: citiesLoading } = useQuery(
    'popularCities',
    citiesApi.getPopular,
    {
      staleTime: 30 * 60 * 1000, // 30 minutes
    }
  )

  // Fetch countries
  const { data: countries, isLoading: countriesLoading } = useQuery(
    'countries',
    countriesApi.getAll,
    {
      staleTime: 60 * 60 * 1000, // 1 hour
      onSuccess: (data) => {
        setCountries(data)
      }
    }
  )

  const features = [
    {
      icon: Globe,
      title: '360° Immersive Views',
      description: 'Ultra-realistic street-level exploration with seamless navigation and dynamic weather',
      color: 'from-blue-500 to-blue-600',
      stats: '50M+ locations'
    },
    {
      icon: Headphones,
      title: 'Spatial Audio Experience',
      description: 'Live radio stations, ambient sounds, and real-time audio from around the world',
      color: 'from-green-500 to-green-600',
      stats: '10K+ audio streams'
    },
    {
      icon: NavigationIcon,
      title: 'Multi-Modal Transport',
      description: 'Walk, cycle, drive, fly, or use public transport with realistic physics',
      color: 'from-purple-500 to-purple-600',
      stats: '15+ transport modes'
    },
    {
      icon: Camera,
      title: 'Cultural Discovery',
      description: 'Markets, landmarks, festivals, and authentic local experiences worldwide',
      color: 'from-orange-500 to-orange-600',
      stats: '100K+ cultural sites'
    }
  ]

  const achievements = [
    { icon: Users, label: '10M+ Users', description: 'Global community' },
    { icon: MapPin, label: '195 Countries', description: 'Complete coverage' },
    { icon: Star, label: '4.9/5 Rating', description: 'User satisfaction' },
    { icon: Award, label: '#1 Platform', description: 'Virtual travel leader' }
  ]

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section with Parallax */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800"
          style={{ y: yRange }}
        />
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10 text-center text-white px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              <span className="block">Explore the</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Impossible
              </span>
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl md:text-3xl mb-8 text-gray-200 max-w-4xl mx-auto leading-relaxed"
          >
            Experience ultra-immersive virtual travel that surpasses Google Earth. 
            Discover every corner of our planet with unprecedented realism.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <InteractiveButton
              variant="primary"
              size="lg"
              icon={Sparkles}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-xl px-10 py-4"
              onClick={() => window.location.href = '/world-explorer'}
            >
              Launch World Explorer
            </InteractiveButton>
            
            <InteractiveButton
              variant="ghost"
              size="lg"
              icon={Play}
              className="text-white border-2 border-white/30 hover:bg-white/10 text-xl px-10 py-4"
              onClick={() => setIsVideoPlaying(!isVideoPlaying)}
            >
              {isVideoPlaying ? 'Pause' : 'Watch Demo'}
            </InteractiveButton>
          </motion.div>

          {/* Live Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon
              return (
                <motion.div
                  key={achievement.label}
                  whileHover={{ scale: 1.05 }}
                  className="glass-card p-6 text-center bg-white/10 backdrop-blur-md"
                >
                  <Icon className="mx-auto mb-3 text-yellow-400" size={32} />
                  <div className="text-2xl font-bold mb-1">{achievement.label}</div>
                  <div className="text-sm text-gray-300">{achievement.description}</div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
          </div>
        </motion.div>
      </section>

      {/* Country Explorer Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
                Explore the Globe
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Discover countries, cultures, and hidden gems from around the world with our interactive explorer
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <CountryExplorer />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-6 text-gradient">
              Next-Generation Features
            </h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto">
              Powered by advanced AI and real-time data, delivering experiences that redefine virtual travel
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="travel-card p-8 h-full group hover:shadow-2xl"
                >
                  <div className="flex items-start space-x-6">
                    <div className={`flex-shrink-0 p-4 rounded-2xl bg-gradient-to-r ${feature.color} text-white group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={40} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                          {feature.stats}
                        </span>
                        <ArrowRight className="text-blue-500 group-hover:translate-x-2 transition-transform duration-300" size={20} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-white relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-6">
              Experience the Future of Travel
            </h2>
            <p className="text-2xl text-purple-200 max-w-4xl mx-auto mb-8">
              See how our platform transforms virtual exploration into reality
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass-card p-8 text-center bg-white/5 backdrop-blur-md"
            >
              <Zap className="mx-auto mb-4 text-yellow-400" size={48} />
              <h3 className="text-2xl font-bold mb-4">Real-Time Data</h3>
              <p className="text-purple-200 mb-6">Live weather, traffic, and events updated every second</p>
              <div className="text-3xl font-bold text-yellow-400">99.9%</div>
              <div className="text-sm text-purple-300">Accuracy</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass-card p-8 text-center bg-white/5 backdrop-blur-md"
            >
              <Shield className="mx-auto mb-4 text-green-400" size={48} />
              <h3 className="text-2xl font-bold mb-4">Secure & Private</h3>
              <p className="text-purple-200 mb-6">Enterprise-grade security with zero data tracking</p>
              <div className="text-3xl font-bold text-green-400">256-bit</div>
              <div className="text-sm text-purple-300">Encryption</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass-card p-8 text-center bg-white/5 backdrop-blur-md"
            >
              <Globe className="mx-auto mb-4 text-blue-400" size={48} />
              <h3 className="text-2xl font-bold mb-4">Global Coverage</h3>
              <p className="text-purple-200 mb-6">Every country, city, and landmark on Earth</p>
              <div className="text-3xl font-bold text-blue-400">100%</div>
              <div className="text-sm text-purple-300">Earth Coverage</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-6 text-gradient">
              Trending Destinations
            </h2>
            <p className="text-2xl text-gray-600">
              Discover the world's most popular virtual travel experiences
            </p>
          </motion.div>

          {citiesLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="large" text="Loading destinations..." />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Fallback destinations with enhanced visuals */}
              {[
                { name: 'Paris', country: 'France', color: 'from-pink-400 to-red-500' },
                { name: 'Tokyo', country: 'Japan', color: 'from-blue-400 to-indigo-500' },
                { name: 'New York', country: 'USA', color: 'from-yellow-400 to-orange-500' },
                { name: 'London', country: 'UK', color: 'from-green-400 to-teal-500' },
                { name: 'Rome', country: 'Italy', color: 'from-orange-400 to-red-500' },
                { name: 'Sydney', country: 'Australia', color: 'from-cyan-400 to-blue-500' },
                { name: 'Dubai', country: 'UAE', color: 'from-purple-400 to-pink-500' },
                { name: 'Barcelona', country: 'Spain', color: 'from-indigo-400 to-purple-500' }
              ].map((destination, index) => (
                <motion.div
                  key={destination.name}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                >
                  <Link to={`/location-explorer?q=${encodeURIComponent(`${destination.name}, ${destination.country}`)}`} className="block travel-card group overflow-hidden">
                    <div className={`aspect-video bg-gradient-to-br ${destination.color} rounded-xl mb-4 relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="text-center"
                        >
                          <MapPin size={40} className="mx-auto mb-2" />
                          <div className="text-sm font-medium opacity-90">Explore Now</div>
                        </motion.div>
                      </div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <div className="text-xl font-bold">{destination.name}</div>
                        <div className="text-sm opacity-90">{destination.country}</div>
                      </div>
                      
                      {/* Live indicator */}
                      <div className="absolute top-4 right-4 flex items-center space-x-1 bg-black/30 rounded-full px-3 py-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-xs text-white">LIVE</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 flex items-center">
                        <Eye size={14} className="mr-1" />
                        360° Available
                      </span>
                      <div className="flex items-center">
                        <Star className="text-yellow-500 fill-current mr-1" size={14} />
                        <span className="text-sm text-gray-600">4.9</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recently Visited */}
      {recentlyVisited.length > 0 && (
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4 text-gradient flex items-center justify-center">
                <Clock className="mr-3" size={40} />
                Continue Your Journey
              </h2>
              <p className="text-xl text-gray-600">
                Pick up where you left off in your virtual adventures
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentlyVisited.slice(0, 4).map((location, index) => (
                <motion.div
                  key={location.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.03 }}
                >
                  <Link to={`/city/${location.id}`} className="block travel-card">
                    <div className="aspect-square bg-gradient-to-br from-blue-200 to-purple-300 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                      <MapPin size={32} className="text-gray-600" />
                      <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="font-semibold text-lg">{location.name}</h3>
                    <p className="text-sm text-gray-500">{location.country}</p>
                    <div className="mt-2 text-xs text-blue-600 font-medium">Last visited 2h ago</div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 bg-white/10 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [1, 2, 1],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-6xl font-bold mb-8">
              The World Awaits
            </h2>
            <p className="text-2xl mb-12 text-blue-100 max-w-4xl mx-auto">
              Join the revolution in virtual travel. Experience destinations beyond imagination, 
              powered by cutting-edge technology and unlimited possibilities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <InteractiveButton
                variant="primary"
                size="lg"
                icon={Globe}
                className="bg-white text-blue-600 hover:bg-gray-100 text-2xl px-12 py-5 font-bold"
                onClick={() => window.location.href = '/explore'}
              >
                Start Your Adventure
              </InteractiveButton>
              
              <InteractiveButton
                variant="ghost"
                size="lg"
                icon={Star}
                className="text-white border-2 border-white/30 hover:bg-white/10 text-xl px-10 py-4"
                onClick={() => window.location.href = '/favorites'}
              >
                View Favorites
              </InteractiveButton>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-blue-200">
              <div className="flex items-center">
                <Shield size={20} className="mr-2" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center">
                <Zap size={20} className="mr-2" />
                <span>Real-Time Updates</span>
              </div>
              <div className="flex items-center">
                <Award size={20} className="mr-2" />
                <span>Award Winning</span>
              </div>
              <div className="flex items-center">
                <Users size={20} className="mr-2" />
                <span>10M+ Users</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
