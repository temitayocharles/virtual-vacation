import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, MapPin, Clock, Thermometer, Wind, Droplets, Eye, 
  Users, Car, Bus, Plane, Ship, Building, School, Cross,
  ShoppingBag, Coffee, Music, Camera, Star, Zap, Wifi,
  TreePine, Mountain, Waves, Sun, Moon, Cloud, CloudRain,
  Activity, BarChart3, TrendingUp, DollarSign, Landmark,
  Radio, Tv, Smartphone, Car as CarIcon, Bike, Train,
  Factory, Recycle, Leaf, Fish, Bird, Flower, Sparkles,
  Calendar, Bell, AlertTriangle, Shield, Heart, Home,
  BookOpen, GraduationCap, Briefcase, Utensils, Bed,
  Church, TreePine as Temple, Film,
  Palette, Gamepad2, Trophy, Medal, Target, Flag,
  Navigation, Compass, Map, Satellite, Radar, Signal
} from 'lucide-react';

// Type definitions
interface GlobalStats {
  total_world_population: number;
  active_flights: number;
  ships_at_sea: number;
  global_internet_users: number;
  languages_spoken_today: number;
  currencies_in_circulation: number;
  time_zones_active: number;
  countries_with_daylight: number;
}

interface NaturalPhenomena {
  active_storms: number;
  earthquakes_today: number;
  volcanic_activity: number;
  forest_fires: number;
  floods: number;
  aurora_activity: string;
  meteor_showers: number;
  solar_activity: string;
}

interface EconomicIndicators {
  global_gdp_growth: number;
  oil_price_usd: number;
  gold_price_usd: number;
  bitcoin_price_usd: number;
  global_inflation_avg: number;
  major_stock_indices: Record<string, number>;
}

interface CulturalEvent {
  name: string;
  location: string;
  participants: number;
}

interface TrafficData {
  congestion_level: string;
  average_speed: number;
  accidents: number;
}

interface TransportData {
  bus_delays: number;
  metro_status: string;
  taxi_availability: string;
}

interface BusinessActivity {
  market_hours: boolean;
  commercial_activity: string;
  restaurant_occupancy: number;
}

interface CrowdLevel {
  density: string;
  count: number;
}

interface CityEvent {
  name: string;
  location: string;
  attendees: number;
  type: string;
}

interface EmergencyServices {
  response_time: number;
  active_calls: number;
  availability: string;
}

interface AirQuality {
  aqi: number;
  status: string;
  pollutants: Record<string, number>;
}

interface EnergyData {
  consumption: number;
  renewable_percentage: number;
  grid_status: string;
}

interface TourismData {
  visitor_count: number;
  popular_attractions: string[];
  hotel_occupancy: number;
}

interface CulturalActivity {
  events: number;
  museums_open: number;
  festivals: string[];
}

interface SportsEvent {
  name: string;
  venue: string;
  attendance: number;
}

interface EducationData {
  schools_active: number;
  student_attendance: number;
  university_sessions: number;
}

interface HealthcareData {
  hospitals_capacity: number;
  emergency_wait: number;
  vaccination_rate: number;
}

interface FinancialData {
  market_status: string;
  trading_volume: number;
  currency_rates: Record<string, number>;
}

interface TechUsage {
  internet_usage: number;
  mobile_data: number;
  social_media_activity: string;
}

interface WorldData {
  timestamp: string;
  cities: Record<string, CityData>;
  global_stats: GlobalStats;
  natural_phenomena: NaturalPhenomena;
  economic_indicators: EconomicIndicators;
  cultural_events: CulturalEvent[];
}

interface CityData {
  local_time: string;
  weather: WeatherData;
  traffic: TrafficData;
  public_transport: TransportData;
  business_activity: BusinessActivity;
  crowd_levels: Record<string, CrowdLevel>;
  events: CityEvent[];
  emergency_services: EmergencyServices;
  air_quality: AirQuality;
  energy_consumption: EnergyData;
  tourism_activity: TourismData;
  cultural_activities: CulturalActivity;
  sports_events: SportsEvent[];
  education_data: EducationData;
  healthcare_status: HealthcareData;
  financial_markets: FinancialData;
  technology_usage: TechUsage;
}

interface WeatherData {
  temperature: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  weather_condition: string;
  visibility: number;
  uv_index: number;
  cloud_cover: number;
}

interface GlobalStats {
  total_world_population: number;
  active_flights: number;
  ships_at_sea: number;
  global_internet_users: number;
  languages_spoken_today: number;
}

const UltraImmersiveWorldExplorer: React.FC = () => {
  const [worldData, setWorldData] = useState<WorldData | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('London, UK');
  const [selectedView, setSelectedView] = useState<string>('overview');
  const [isConnected, setIsConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'2d' | '3d' | 'satellite' | 'street'>('2d');
  const [timeZone, setTimeZone] = useState<string>('local');
  const [dataFilters, setDataFilters] = useState<string[]>(['all']);
  
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to World Simulation Engine WebSocket
    const connectWebSocket = () => {
      wsRef.current = new WebSocket('ws://localhost:8005/ws/world-simulation');
      
      wsRef.current.onopen = () => {
        setIsConnected(true);
        console.log('🌍 Connected to World Simulation Engine');
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setWorldData(data);
        } catch (error) {
          console.error('Error parsing world data:', error);
        }
      };
      
      wsRef.current.onclose = () => {
        setIsConnected(false);
        console.log('🌍 Disconnected from World Simulation Engine');
        // Attempt to reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };
      
      wsRef.current.onerror = (error) => {
        console.error('World Simulation WebSocket error:', error);
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const getCityData = (cityName: string): CityData | null => {
    return worldData?.cities[cityName] || null;
  };

  const formatPopulation = (num: number): string => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getWeatherIcon = (condition: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'Clear': <Sun className="w-6 h-6 text-yellow-400" />,
      'Partly Cloudy': <Cloud className="w-6 h-6 text-gray-400" />,
      'Cloudy': <Cloud className="w-6 h-6 text-gray-500" />,
      'Overcast': <Cloud className="w-6 h-6 text-gray-600" />,
      'Light Rain': <CloudRain className="w-6 h-6 text-blue-400" />,
      'Heavy Rain': <CloudRain className="w-6 h-6 text-blue-600" />,
      'Snow': <Sparkles className="w-6 h-6 text-white" />,
      'Fog': <Cloud className="w-6 h-6 text-gray-300" />
    };
    return iconMap[condition] || <Sun className="w-6 h-6 text-yellow-400" />;
  };

  const GlobalOverviewPanel: React.FC = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-900 via-purple-900 to-black p-6 rounded-xl border border-purple-500/20"
    >
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
        <Globe className="w-8 h-8 mr-3 text-blue-400" />
        Global World Overview
      </h3>
      
      {worldData?.global_stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-black/30 p-4 rounded-lg">
            <Users className="w-6 h-6 text-green-400 mb-2" />
            <div className="text-sm text-gray-300">World Population</div>
            <div className="text-xl font-bold text-white">{formatPopulation(worldData.global_stats.total_world_population)}</div>
          </div>
          
          <div className="bg-black/30 p-4 rounded-lg">
            <Plane className="w-6 h-6 text-blue-400 mb-2" />
            <div className="text-sm text-gray-300">Active Flights</div>
            <div className="text-xl font-bold text-white">{worldData.global_stats.active_flights.toLocaleString()}</div>
          </div>
          
          <div className="bg-black/30 p-4 rounded-lg">
            <Ship className="w-6 h-6 text-cyan-400 mb-2" />
            <div className="text-sm text-gray-300">Ships at Sea</div>
            <div className="text-xl font-bold text-white">{worldData.global_stats.ships_at_sea.toLocaleString()}</div>
          </div>
          
          <div className="bg-black/30 p-4 rounded-lg">
            <Wifi className="w-6 h-6 text-purple-400 mb-2" />
            <div className="text-sm text-gray-300">Internet Users</div>
            <div className="text-xl font-bold text-white">{formatPopulation(worldData.global_stats.global_internet_users)}</div>
          </div>
          
          <div className="bg-black/30 p-4 rounded-lg">
            <Radio className="w-6 h-6 text-orange-400 mb-2" />
            <div className="text-sm text-gray-300">Languages Active</div>
            <div className="text-xl font-bold text-white">{worldData.global_stats.languages_spoken_today}</div>
          </div>
        </div>
      )}

      {/* Natural Phenomena */}
      {worldData?.natural_phenomena && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
            Natural Phenomena
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-orange-900/30 p-3 rounded-lg border border-orange-500/20">
              <div className="text-sm text-orange-300">Active Storms</div>
              <div className="text-lg font-bold text-white">{worldData.natural_phenomena.active_storms}</div>
            </div>
            <div className="bg-red-900/30 p-3 rounded-lg border border-red-500/20">
              <div className="text-sm text-red-300">Earthquakes Today</div>
              <div className="text-lg font-bold text-white">{worldData.natural_phenomena.earthquakes_today}</div>
            </div>
            <div className="bg-green-900/30 p-3 rounded-lg border border-green-500/20">
              <div className="text-sm text-green-300">Forest Fires</div>
              <div className="text-lg font-bold text-white">{worldData.natural_phenomena.forest_fires}</div>
            </div>
            <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-500/20">
              <div className="text-sm text-purple-300">Aurora Activity</div>
              <div className="text-lg font-bold text-white">{worldData.natural_phenomena.aurora_activity}</div>
            </div>
          </div>
        </div>
      )}

      {/* Economic Indicators */}
      {worldData?.economic_indicators && (
        <div>
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
            Global Economics
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-green-900/30 p-3 rounded-lg border border-green-500/20">
              <div className="text-sm text-green-300">GDP Growth</div>
              <div className="text-lg font-bold text-white">{worldData.economic_indicators.global_gdp_growth}%</div>
            </div>
            <div className="bg-yellow-900/30 p-3 rounded-lg border border-yellow-500/20">
              <div className="text-sm text-yellow-300">Oil Price</div>
              <div className="text-lg font-bold text-white">${worldData.economic_indicators.oil_price_usd}</div>
            </div>
            <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-500/20">
              <div className="text-sm text-blue-300">Bitcoin</div>
              <div className="text-lg font-bold text-white">${worldData.economic_indicators.bitcoin_price_usd.toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );

  const CityDetailPanel: React.FC<{ cityName: string }> = ({ cityName }) => {
    const cityData = getCityData(cityName);
    
    if (!cityData) {
      return (
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="text-center text-gray-400">
            <MapPin className="w-12 h-12 mx-auto mb-4" />
            <p>City data not available</p>
          </div>
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6 rounded-xl border border-blue-500/20"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{cityName}</h2>
            <div className="flex items-center text-gray-300">
              <Clock className="w-5 h-5 mr-2" />
              <span>{cityData.local_time}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end mb-2">
              {getWeatherIcon(cityData.weather.weather_condition)}
              <span className="text-2xl font-bold text-white ml-2">{cityData.weather.temperature}°C</span>
            </div>
            <div className="text-sm text-gray-300">Feels like {cityData.weather.feels_like}°C</div>
          </div>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-black/30 p-3 rounded-lg">
            <Wind className="w-5 h-5 text-blue-400 mb-1" />
            <div className="text-xs text-gray-400">Wind</div>
            <div className="font-semibold text-white">{cityData.weather.wind_speed} km/h</div>
          </div>
          <div className="bg-black/30 p-3 rounded-lg">
            <Droplets className="w-5 h-5 text-cyan-400 mb-1" />
            <div className="text-xs text-gray-400">Humidity</div>
            <div className="font-semibold text-white">{cityData.weather.humidity}%</div>
          </div>
          <div className="bg-black/30 p-3 rounded-lg">
            <Eye className="w-5 h-5 text-purple-400 mb-1" />
            <div className="text-xs text-gray-400">Visibility</div>
            <div className="font-semibold text-white">{cityData.weather.visibility} km</div>
          </div>
          <div className="bg-black/30 p-3 rounded-lg">
            <Sun className="w-5 h-5 text-yellow-400 mb-1" />
            <div className="text-xs text-gray-400">UV Index</div>
            <div className="font-semibold text-white">{cityData.weather.uv_index}</div>
          </div>
        </div>

        {/* Traffic & Transport */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
            <Car className="w-5 h-5 mr-2 text-red-400" />
            Transportation
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-red-900/30 p-3 rounded-lg border border-red-500/20">
              <div className="text-sm text-red-300">Traffic</div>
              <div className="font-bold text-white">{cityData.traffic.overall_congestion}</div>
            </div>
            <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-500/20">
              <div className="text-sm text-blue-300">Metro Status</div>
              <div className="font-bold text-white">{cityData.public_transport.metro_status}</div>
            </div>
            <div className="bg-green-900/30 p-3 rounded-lg border border-green-500/20">
              <div className="text-sm text-green-300">Bus On-Time</div>
              <div className="font-bold text-white">{cityData.public_transport.bus_on_time_percentage}%</div>
            </div>
          </div>
        </div>

        {/* Business Activity */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
            <Building className="w-5 h-5 mr-2 text-indigo-400" />
            Business & Economy
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-indigo-900/30 p-3 rounded-lg border border-indigo-500/20">
              <div className="text-sm text-indigo-300">Activity Level</div>
              <div className="font-bold text-white">{cityData.business_activity.activity_level}</div>
            </div>
            <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-500/20">
              <div className="text-sm text-purple-300">Businesses Open</div>
              <div className="font-bold text-white">{cityData.business_activity.open_businesses_percentage}%</div>
            </div>
            <div className="bg-pink-900/30 p-3 rounded-lg border border-pink-500/20">
              <div className="text-sm text-pink-300">Office Occupancy</div>
              <div className="font-bold text-white">{cityData.business_activity.office_occupancy}</div>
            </div>
          </div>
        </div>

        {/* Air Quality & Environment */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
            <Leaf className="w-5 h-5 mr-2 text-green-400" />
            Environment
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-green-900/30 p-3 rounded-lg border border-green-500/20">
              <div className="text-sm text-green-300">Air Quality</div>
              <div className="font-bold text-white">{cityData.air_quality.quality}</div>
              <div className="text-xs text-gray-400">AQI: {cityData.air_quality.aqi}</div>
            </div>
            <div className="bg-yellow-900/30 p-3 rounded-lg border border-yellow-500/20">
              <div className="text-sm text-yellow-300">Energy Use</div>
              <div className="font-bold text-white">{cityData.energy_consumption.consumption_level}</div>
            </div>
          </div>
        </div>

        {/* Cultural Activities */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
            <Palette className="w-5 h-5 mr-2 text-pink-400" />
            Culture & Entertainment
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-pink-900/30 p-3 rounded-lg border border-pink-500/20">
              <div className="text-sm text-pink-300">Theaters</div>
              <div className="font-bold text-white">{cityData.cultural_activities.theaters_showing}</div>
            </div>
            <div className="bg-indigo-900/30 p-3 rounded-lg border border-indigo-500/20">
              <div className="text-sm text-indigo-300">Museums Open</div>
              <div className="font-bold text-white">{cityData.cultural_activities.museums_open}</div>
            </div>
            <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-500/20">
              <div className="text-sm text-purple-300">Events Today</div>
              <div className="font-bold text-white">{cityData.cultural_activities.cultural_events_today}</div>
            </div>
          </div>
        </div>

        {/* Live Events */}
        {cityData.events && cityData.events.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-orange-400" />
              Live Events
            </h4>
            <div className="space-y-2">
              {cityData.events.slice(0, 3).map((event, index) => (
                <div key={index} className="bg-black/30 p-3 rounded-lg border border-gray-600/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-white">{event.name}</div>
                      <div className="text-sm text-gray-400">{event.location}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-orange-300">{event.status}</div>
                      <div className="text-xs text-gray-400">{event.attendance} people</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  const ViewModeSelector: React.FC = () => (
    <div className="flex space-x-2 bg-black/50 p-2 rounded-lg">
      {[
        { mode: '2d', icon: Map, label: '2D Map' },
        { mode: '3d', icon: Mountain, label: '3D View' },
        { mode: 'satellite', icon: Satellite, label: 'Satellite' },
        { mode: 'street', icon: Navigation, label: 'Street View' }
      ].map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          onClick={() => setViewMode(mode as any)}
          className={`flex items-center px-3 py-2 rounded-lg transition-all ${
            viewMode === mode
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Icon className="w-4 h-4 mr-2" />
          <span className="text-sm">{label}</span>
        </button>
      ))}
    </div>
  );

  const CitySelector: React.FC = () => {
    const availableCities = worldData?.cities ? Object.keys(worldData.cities) : [];
    
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {availableCities.map((city) => (
          <button
            key={city}
            onClick={() => setSelectedCity(city)}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              selectedCity === city
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <MapPin className="w-4 h-4 inline mr-1" />
            {city}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-black p-6 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
                <Globe className="w-10 h-10 mr-4 text-blue-400" />
                Ultra World Explorer
              </h1>
              <p className="text-gray-300">Experience every corner of our planet in real-time</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center px-3 py-2 rounded-lg ${
                isConnected ? 'bg-green-900/30 border border-green-500/20' : 'bg-red-900/30 border border-red-500/20'
              }`}>
                <Signal className={`w-4 h-4 mr-2 ${isConnected ? 'text-green-400' : 'text-red-400'}`} />
                <span className={`text-sm ${isConnected ? 'text-green-300' : 'text-red-300'}`}>
                  {isConnected ? 'Live Data Connected' : 'Connecting...'}
                </span>
              </div>
              <ViewModeSelector />
            </div>
          </div>
          
          {/* Search and Navigation */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cities, countries, or landmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              {['overview', 'detailed', 'live-events', 'analytics'].map((view) => (
                <button
                  key={view}
                  onClick={() => setSelectedView(view)}
                  className={`px-4 py-3 rounded-lg text-sm capitalize transition-all ${
                    selectedView === view
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {view.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <AnimatePresence mode="wait">
          {selectedView === 'overview' && (
            <motion.div key="overview" className="space-y-6">
              <GlobalOverviewPanel />
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Major Cities Live Data</h3>
                <CitySelector />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {worldData?.cities && Object.entries(worldData.cities).slice(0, 2).map(([cityName]) => (
                    <CityDetailPanel key={cityName} cityName={cityName} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {selectedView === 'detailed' && (
            <motion.div key="detailed">
              <CityDetailPanel cityName={selectedCity} />
            </motion.div>
          )}

          {selectedView === 'live-events' && (
            <motion.div key="live-events" className="space-y-6">
              <div className="bg-gradient-to-br from-purple-900 via-pink-900 to-black p-6 rounded-xl border border-purple-500/20">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <Calendar className="w-8 h-8 mr-3 text-purple-400" />
                  Global Live Events
                </h3>
                {worldData?.cultural_events && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {worldData.cultural_events.map((event, index) => (
                      <div key={index} className="bg-black/30 p-4 rounded-lg border border-purple-500/20">
                        <h4 className="font-semibold text-white mb-2">{event.name}</h4>
                        <p className="text-sm text-gray-300 mb-2">{event.location}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-purple-300">Participants</span>
                          <span className="font-bold text-white">{formatPopulation(event.participants)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {selectedView === 'analytics' && (
            <motion.div key="analytics" className="space-y-6">
              <div className="bg-gradient-to-br from-green-900 via-teal-900 to-black p-6 rounded-xl border border-green-500/20">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <BarChart3 className="w-8 h-8 mr-3 text-green-400" />
                  Global Analytics Dashboard
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-black/30 p-4 rounded-lg">
                    <Activity className="w-6 h-6 text-blue-400 mb-2" />
                    <div className="text-sm text-gray-300">Data Points/Sec</div>
                    <div className="text-2xl font-bold text-white">{(Math.random() * 10000).toFixed(0)}</div>
                  </div>
                  <div className="bg-black/30 p-4 rounded-lg">
                    <Radar className="w-6 h-6 text-green-400 mb-2" />
                    <div className="text-sm text-gray-300">Sensors Active</div>
                    <div className="text-2xl font-bold text-white">{(Math.random() * 1000000).toFixed(0)}</div>
                  </div>
                  <div className="bg-black/30 p-4 rounded-lg">
                    <Signal className="w-6 h-6 text-purple-400 mb-2" />
                    <div className="text-sm text-gray-300">API Calls/Min</div>
                    <div className="text-2xl font-bold text-white">{(Math.random() * 50000).toFixed(0)}</div>
                  </div>
                  <div className="bg-black/30 p-4 rounded-lg">
                    <Compass className="w-6 h-6 text-orange-400 mb-2" />
                    <div className="text-sm text-gray-300">Locations Tracked</div>
                    <div className="text-2xl font-bold text-white">{(Math.random() * 100000).toFixed(0)}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live Data Timestamp */}
        {worldData && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Last updated: {new Date(worldData.timestamp).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UltraImmersiveWorldExplorer;
