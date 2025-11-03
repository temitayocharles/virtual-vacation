import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  Trash2,
  MapPin,
  Filter,
  Search,
  Star,
  Eye,
  ArrowRight,
  Folder,
  Plus,
  Share2,
  Download
} from 'lucide-react'
import { designSystem } from '../config/designSystem'
import InteractiveButton from '../components/UI/InteractiveButton'

interface FavoriteLocation {
  id: string
  name: string
  country: string
  type: 'city' | 'country' | 'landmark'
  rating: number
  views: number
  image?: string
  savedDate: string
  collections: string[]
}

const FavoritesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'city' | 'country' | 'landmark'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'name'>('recent')

  // Mock favorites data
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([
    { id: '1', name: 'Paris', country: 'France', type: 'city', rating: 4.9, views: 2450, savedDate: '2025-11-01', collections: ['Europe Trip'] },
    { id: '2', name: 'Tokyo', country: 'Japan', type: 'city', rating: 4.8, views: 2100, savedDate: '2025-10-28', collections: ['Asia'] },
    { id: '3', name: 'Rome', country: 'Italy', type: 'city', rating: 4.7, views: 1890, savedDate: '2025-10-25', collections: ['Italy', 'Historic'] },
    { id: '4', name: 'France', country: 'Europe', type: 'country', rating: 4.8, views: 3200, savedDate: '2025-10-20', collections: ['Countries'] },
    { id: '5', name: 'Statue of Liberty', country: 'USA', type: 'landmark', rating: 4.6, views: 1560, savedDate: '2025-10-15', collections: ['Landmarks'] },
    { id: '6', name: 'Great Wall of China', country: 'China', type: 'landmark', rating: 4.9, views: 2890, savedDate: '2025-10-10', collections: ['Landmarks', 'Asia'] }
  ])

  const [collections, setCollections] = useState(['Europe Trip', 'Asia', 'Italy', 'Historic', 'Countries', 'Landmarks'])

  const filteredFavorites = favorites
    .filter(fav => selectedFilter === 'all' || fav.type === selectedFilter)
    .filter(fav => fav.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'name':
          return a.name.localeCompare(b.name)
        case 'recent':
        default:
          return new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime()
      }
    })

  const handleRemoveFavorite = (id: string) => {
    setFavorites(favorites.filter(fav => fav.id !== id))
  }

  const stats = {
    total: favorites.length,
    cities: favorites.filter(f => f.type === 'city').length,
    countries: favorites.filter(f => f.type === 'country').length,
    landmarks: favorites.filter(f => f.type === 'landmark').length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className={`${designSystem.layout.sectionWithPadding} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10" />
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <div className="flex items-center mb-6">
            <Heart className="text-red-500 mr-3 fill-red-500" size={40} />
            <h1 className={`${designSystem.typography.h1Large} text-gradient`}>
              Your Favorites
            </h1>
          </div>

          <p className={`${designSystem.typography.subtitle} mb-8 max-w-2xl`}>
            Curate your personal collection of world's most amazing destinations
          </p>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="travel-card p-6 text-center">
              <div className="text-3xl font-bold text-red-600 mb-1">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Favorites</div>
            </div>
            <div className="travel-card p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{stats.cities}</div>
              <div className="text-sm text-gray-600">Cities</div>
            </div>
            <div className="travel-card p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">{stats.countries}</div>
              <div className="text-sm text-gray-600">Countries</div>
            </div>
            <div className="travel-card p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">{stats.landmarks}</div>
              <div className="text-sm text-gray-600">Landmarks</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Controls Bar */}
      <section className={`${designSystem.layout.sectionWithPadding} bg-white border-b border-gray-200`}>
        <div className="grid md:grid-cols-12 gap-4 items-center">
          {/* Search */}
          <div className="md:col-span-4 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your favorites..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as any)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="city">Cities</option>
              <option value="country">Countries</option>
              <option value="landmark">Landmarks</option>
            </select>
          </div>

          {/* Sort */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Most Recent</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="md:col-span-2 flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className={`${designSystem.layout.sectionWithPadding}`}>
        {filteredFavorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Heart size={64} className="text-gray-300 mx-auto mb-6" />
            <h3 className={designSystem.typography.h3 + ' text-gray-600 mb-3'}>
              No favorites yet
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Start exploring destinations and add them to your favorites to build your personalized collection.
            </p>
            <Link to="/explore">
              <InteractiveButton variant="primary" size="lg">
                Explore Destinations
              </InteractiveButton>
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence>
                  {filteredFavorites.map((fav, idx) => (
                    <motion.div
                      key={fav.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: idx * 0.05 }}
                      className="travel-card group overflow-hidden"
                    >
                      <div className="aspect-square bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mb-4 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                          <MapPin size={48} />
                        </div>

                        {/* Badge */}
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1">
                          <Star className="text-yellow-500 fill-current" size={16} />
                          <span className="text-sm font-semibold text-gray-900">{fav.rating}</span>
                        </div>

                        {/* Actions Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <InteractiveButton
                            variant="secondary"
                            size="sm"
                            icon={Eye}
                            onClick={() => alert(`Viewing ${fav.name}...`)}
                          >
                            View
                          </InteractiveButton>
                          <button
                            onClick={() => handleRemoveFavorite(fav.id)}
                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{fav.name}</h3>
                        <p className="text-sm text-gray-600 mb-3 flex items-center">
                          <MapPin size={14} className="mr-1" />
                          {fav.country}
                        </p>

                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {fav.type.charAt(0).toUpperCase() + fav.type.slice(1)}
                          </span>
                          <span className="text-xs text-gray-500">{fav.views} views</span>
                        </div>

                        <div className="flex gap-2">
                          <InteractiveButton
                            variant="primary"
                            size="sm"
                            className="flex-1"
                            onClick={() => alert(`Opening ${fav.name}...`)}
                          >
                            Open
                          </InteractiveButton>
                          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            <Share2 size={16} className="text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredFavorites.map((fav, idx) => (
                    <motion.div
                      key={fav.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.05 }}
                      className="travel-card p-6 flex items-center justify-between group hover:shadow-lg"
                    >
                      <div className="flex items-center flex-1">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                          <MapPin size={32} />
                        </div>

                        <div className="ml-6 flex-1">
                          <h3 className="text-lg font-bold text-gray-900">{fav.name}</h3>
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <MapPin size={14} className="mr-1" />
                            {fav.country}
                            <span className="mx-3 text-gray-300">•</span>
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                              {fav.type}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 ml-6">
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="text-yellow-500 fill-current" size={16} />
                            <span className="font-semibold text-gray-900">{fav.rating}</span>
                          </div>
                          <span className="text-xs text-gray-500">{fav.views} views</span>
                        </div>

                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <InteractiveButton
                            variant="primary"
                            size="sm"
                            onClick={() => alert(`Opening ${fav.name}...`)}
                          >
                            Open
                          </InteractiveButton>
                          <button
                            onClick={() => handleRemoveFavorite(fav.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </section>

      {/* Collections Section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50">
        <div className={`${designSystem.layout.sectionWithPadding}`}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className={`${designSystem.typography.h2} mb-4 text-gradient flex items-center`}>
              <Folder className="mr-3" size={40} />
              Your Collections
            </h2>
            <p className={designSystem.typography.subtitle}>
              Organize your favorites into custom collections
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection, idx) => (
              <motion.div
                key={collection}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="travel-card p-6 cursor-pointer group hover:shadow-lg"
              >
                <Folder className="text-blue-500 mb-3 group-hover:scale-110 transition-transform" size={32} />
                <h3 className="font-bold text-gray-900 mb-2">{collection}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {favorites.filter(f => f.collections.includes(collection)).length} items
                </p>
                <InteractiveButton variant="primary" size="sm">
                  View Collection
                </InteractiveButton>
              </motion.div>
            ))}

            {/* Add New Collection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: collections.length * 0.1 }}
              viewport={{ once: true }}
              className="travel-card p-6 border-2 border-dashed border-blue-300 flex flex-col items-center justify-center cursor-pointer group hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <Plus className="text-blue-400 group-hover:text-blue-600 mb-3 group-hover:scale-110 transition-transform" size={32} />
              <h3 className="font-bold text-gray-900 mb-1">Create Collection</h3>
              <p className="text-sm text-gray-600 text-center">Organize your favorites</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-red-500 to-pink-500 text-white">
        <div className={`${designSystem.layout.containerMaxWidth} mx-auto text-center`}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Explore More Destinations
            </h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Discover incredible places around the world and add them to your collection
            </p>
            <Link to="/explore">
              <InteractiveButton
                variant="secondary"
                size="lg"
                icon={ArrowRight}
                className="bg-white text-red-600 hover:bg-gray-100 text-lg px-8"
              >
                Continue Exploring
              </InteractiveButton>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default FavoritesPage
