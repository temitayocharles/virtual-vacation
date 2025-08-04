import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Users, Calendar, Globe, Flag, DollarSign, Clock, Car, Phone, ChevronLeft, ChevronRight, Star, TrendingUp } from 'lucide-react';
import { countriesApi, Country } from '../services/countriesApi';
import './CountryExplorer.css';

interface CountryExplorerProps {
  onCountrySelect?: (country: any) => void;
}

const CountryExplorer: React.FC<CountryExplorerProps> = ({ onCountrySelect }) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [popularDestinations, setPopularDestinations] = useState<Country[]>([]);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const regions = [
    'all', 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania'
  ];

  useEffect(() => {
    loadCountries();
    loadPopularDestinations();
  }, []);

  useEffect(() => {
    filterCountries();
  }, [searchQuery, selectedRegion, countries]);

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      if (popularDestinations.length > 0) {
        setCurrentCarouselIndex((prev) => 
          prev === popularDestinations.length - 1 ? 0 : prev + 1
        );
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [popularDestinations.length]);

  const loadCountries = async () => {
    try {
      setLoading(true);
      const allCountries = await countriesApi.getAllCountries();
      setCountries(allCountries);
      setFilteredCountries(allCountries);
    } catch (error) {
      console.error('Error loading countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPopularDestinations = async () => {
    try {
      const popular = await countriesApi.getPopularDestinations();
      setPopularDestinations(popular.slice(0, 12)); // Show top 12 for carousel
    } catch (error) {
      console.error('Error loading popular destinations:', error);
    }
  };

  const filterCountries = () => {
    let filtered = countries;

    // Filter by region
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(country => country.region === selectedRegion);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(country =>
        country.name.common.toLowerCase().includes(query) ||
        country.name.official.toLowerCase().includes(query) ||
        country.capital?.some(capital => capital.toLowerCase().includes(query)) ||
        country.region.toLowerCase().includes(query) ||
        country.subregion.toLowerCase().includes(query)
      );
    }

    setFilteredCountries(filtered);
  };

  const handleCountryClick = async (country: Country) => {
    try {
      const insights = await countriesApi.getCountryInsights(country.name.common);
      setSelectedCountry(country);
      onCountrySelect?.(insights);
    } catch (error) {
      console.error('Error getting country insights:', error);
      setSelectedCountry(country);
      onCountrySelect?.(countriesApi.formatCountryData(country));
    }
  };

  const nextCarouselSlide = () => {
    setCurrentCarouselIndex((prev) => 
      prev === popularDestinations.length - 1 ? 0 : prev + 1
    );
  };

  const prevCarouselSlide = () => {
    setCurrentCarouselIndex((prev) => 
      prev === 0 ? popularDestinations.length - 1 : prev - 1
    );
  };

  const CountryCard = ({ country, isPopular = false, index = 0 }: { country: Country; isPopular?: boolean; index?: number }) => {
    const formatted = countriesApi.formatCountryData(country);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.6, 
          delay: index * 0.1,
          type: "spring",
          stiffness: 100
        }}
        whileHover={{ 
          scale: 1.05, 
          y: -8,
          rotateY: 2,
        }}
        whileTap={{ scale: 0.95 }}
        className="country-card"
        onClick={() => handleCountryClick(country)}
      >
        {isPopular && (
          <motion.div 
            className="popular-badge"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Star className="w-3 h-3 inline mr-1" />
            POPULAR
          </motion.div>
        )}
        
        <div className="country-flag">
          <motion.div
            className="text-4xl mb-2"
            whileHover={{ scale: 1.2, rotate: 5 }}
            transition={{ duration: 0.3 }}
          >
            {country.flag}
          </motion.div>
        </div>
        
        <div className="country-info">
          <motion.h3 
            className="country-name"
            whileHover={{ scale: 1.02 }}
          >
            {formatted.name}
          </motion.h3>
          
          <div className="country-details">
            <div className="country-detail-item">
              <MapPin className="icon" />
              <span>{formatted.region}</span>
            </div>
            
            <div className="country-detail-item">
              <Globe className="icon" />
              <span>{formatted.capital}</span>
            </div>
            
            <div className="country-detail-item">
              <Users className="icon" />
              <span>{formatted.population}</span>
            </div>
            
            <div className="country-detail-item">
              <DollarSign className="icon" />
              <span>{formatted.currencyDisplay.split('(')[0]}</span>
            </div>
          </div>
          
          <div className="language-tags">
            {formatted.languageNames.split(',').slice(0, 3).map((lang, idx) => (
              <motion.span 
                key={idx} 
                className="language-tag"
                whileHover={{ scale: 1.1 }}
              >
                {lang.trim()}
              </motion.span>
            ))}
          </div>
        </div>
        
        <motion.button 
          className="explore-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>Explore Destination</span>
        </motion.button>
      </motion.div>
    );
  };

  const CountryDetailModal = ({ country }: { country: Country }) => {
    const formatted = countriesApi.formatCountryData(country);
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="country-modal-overlay"
        onClick={() => setSelectedCountry(null)}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotateY: -15 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          exit={{ scale: 0.8, opacity: 0, rotateY: 15 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="country-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <div className="flex items-center gap-6">
              <motion.div 
                className="text-8xl"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                {country.flag}
              </motion.div>
              <div className="modal-country-info">
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {formatted.name}
                </motion.h2>
                <motion.p 
                  className="official-name"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {formatted.officialName}
                </motion.p>
                <motion.p 
                  className="capital"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Capital: {formatted.capital}
                </motion.p>
              </div>
            </div>
            <motion.button
              className="close-button"
              onClick={() => setSelectedCountry(null)}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              ×
            </motion.button>
          </div>

          <div className="modal-info-grid">
            {/* Geographic Information */}
            <motion.div 
              className="info-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3>
                <MapPin className="icon" />
                Geography
              </h3>
              <div className="space-y-2">
                <div className="info-item">
                  <span className="info-label">Region:</span>
                  <span className="info-value">{formatted.region}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Subregion:</span>
                  <span className="info-value">{formatted.subregion}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Area:</span>
                  <span className="info-value">{formatted.area}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Landlocked:</span>
                  <span className="info-value">{formatted.landlocked ? 'Yes' : 'No'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Coordinates:</span>
                  <span className="info-value">
                    {formatted.coordinates[0].toFixed(2)}, {formatted.coordinates[1].toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Population & Demographics */}
            <motion.div 
              className="info-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3>
                <Users className="icon" />
                Demographics
              </h3>
              <div className="space-y-2">
                <div className="info-item">
                  <span className="info-label">Population:</span>
                  <span className="info-value">{formatted.population}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Languages:</span>
                  <span className="info-value text-xs">{formatted.languageNames}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Male Demonym:</span>
                  <span className="info-value">{formatted.demonyms.eng.m}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Female Demonym:</span>
                  <span className="info-value">{formatted.demonyms.eng.f}</span>
                </div>
              </div>
            </motion.div>

            {/* Political & Status */}
            <motion.div 
              className="info-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h3>
                <Flag className="icon" />
                Political
              </h3>
              <div className="space-y-2">
                <div className="info-item">
                  <span className="info-label">Independent:</span>
                  <span className="info-value">{formatted.independent ? 'Yes' : 'No'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">UN Member:</span>
                  <span className="info-value">{formatted.unMember ? 'Yes' : 'No'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status:</span>
                  <span className="info-value capitalize">{formatted.status.replace('-', ' ')}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">FIFA Code:</span>
                  <span className="info-value">{formatted.fifa || 'N/A'}</span>
                </div>
              </div>
            </motion.div>

            {/* Currency & Economy */}
            <motion.div 
              className="info-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h3>
                <DollarSign className="icon" />
                Economy
              </h3>
              <div className="space-y-2">
                <div className="info-item">
                  <span className="info-label">Currency:</span>
                  <span className="info-value text-xs">{formatted.currencyDisplay}</span>
                </div>
                {country.gini && (
                  <div className="info-item">
                    <span className="info-label">Gini Index:</span>
                    <span className="info-value">
                      {Object.values(country.gini)[0]} ({Object.keys(country.gini)[0]})
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Time & Communication */}
            <motion.div 
              className="info-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <h3>
                <Clock className="icon" />
                Time & Communication
              </h3>
              <div className="space-y-2">
                <div className="info-item">
                  <span className="info-label">Timezones:</span>
                  <span className="info-value text-xs">{formatted.timezones.slice(0, 2).join(', ')}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Week Starts:</span>
                  <span className="info-value capitalize">{formatted.startOfWeek}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Calling Code:</span>
                  <span className="info-value">{formatted.callingCode}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Domain:</span>
                  <span className="info-value">{formatted.topLevelDomain.join(', ')}</span>
                </div>
              </div>
            </motion.div>

            {/* Transportation */}
            <motion.div 
              className="info-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <h3>
                <Car className="icon" />
                Transportation
              </h3>
              <div className="space-y-2">
                <div className="info-item">
                  <span className="info-label">Driving Side:</span>
                  <span className="info-value capitalize">{formatted.drivingSide}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Car Signs:</span>
                  <span className="info-value">{country.car.signs.join(', ')}</span>
                </div>
                {formatted.borders.length > 0 && (
                  <div className="info-item">
                    <span className="info-label">Borders:</span>
                    <span className="info-value text-xs">{formatted.borders.slice(0, 3).join(', ')}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <motion.div 
            className="modal-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <motion.button
              className="action-button primary"
              onClick={() => window.open(formatted.googleMaps, '_blank')}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              🗺️ Explore on Maps
            </motion.button>
            <motion.button
              className="action-button secondary"
              onClick={() => {
                setSelectedCountry(null);
                onCountrySelect?.(formatted);
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              🌍 Start Virtual Tour
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="country-explorer">
        <div className="loading-container">
          <motion.div
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <div className="loading-text">Discovering Amazing Destinations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="country-explorer">
      {/* Search and Filter Section */}
      <motion.div 
        className="search-filter-section"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5 z-10" />
            <input
              type="text"
              placeholder="Search countries, capitals, regions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="region-select"
          >
            {regions.map(region => (
              <option key={region} value={region} className="bg-gray-800">
                {region === 'all' ? 'All Regions' : region}
              </option>
            ))}
          </select>
        </div>
        
        <div className="quick-filters">
          <span className="text-blue-300 text-sm font-medium">Quick filters:</span>
          {['Independent', 'UN Member', 'Island Nations', 'Landlocked'].map(filter => (
            <motion.button
              key={filter}
              className="filter-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {filter}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Popular Destinations Carousel */}
      {popularDestinations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="section-header">
            <TrendingUp className="icon" />
            Trending Destinations
          </div>
          
          <div className="relative">
            <div className="overflow-hidden rounded-2xl">
              <motion.div
                ref={carouselRef}
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentCarouselIndex * (100 / 3)}%)`,
                  width: `${popularDestinations.length * (100 / 3)}%`
                }}
              >
                {popularDestinations.map((country, index) => (
                  <div
                    key={country.cca3}
                    className="flex-shrink-0 px-2"
                    style={{ width: `${100 / popularDestinations.length}%` }}
                  >
                    <CountryCard country={country} isPopular index={index} />
                  </div>
                ))}
              </motion.div>
            </div>
            
            {/* Carousel Controls */}
            <motion.button
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-md border border-white/20 transition-all duration-300"
              onClick={prevCarouselSlide}
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
            
            <motion.button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-md border border-white/20 transition-all duration-300"
              onClick={nextCarouselSlide}
              whileHover={{ scale: 1.1, x: 2 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
            
            {/* Carousel Indicators */}
            <div className="flex justify-center mt-6 gap-2">
              {Array.from({ length: Math.ceil(popularDestinations.length / 3) }).map((_, index) => (
                <motion.button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    Math.floor(currentCarouselIndex / 3) === index
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-400 shadow-lg shadow-cyan-400/50'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                  onClick={() => setCurrentCarouselIndex(index * 3)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Countries Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="section-header">
            <Globe className="icon" />
            {selectedRegion === 'all' ? 'Explore All Countries' : `Discover ${selectedRegion}`}
          </div>
          <div className="result-count">
            {filteredCountries.length} {filteredCountries.length === 1 ? 'destination' : 'destinations'} found
          </div>
        </div>
        
        <motion.div
          layout
          className="countries-grid"
        >
          <AnimatePresence mode="popLayout">
            {filteredCountries.map((country, index) => (
              <motion.div
                key={country.cca3}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <CountryCard country={country} index={index} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Country Detail Modal */}
      <AnimatePresence>
        {selectedCountry && (
          <CountryDetailModal country={selectedCountry} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CountryExplorer;
