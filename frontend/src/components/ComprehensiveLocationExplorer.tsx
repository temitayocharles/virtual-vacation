import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Camera, Users, Clock, Thermometer, Wind, Droplets,
  Building, School, Cross, ShoppingBag, Coffee, Music, TreePine,
  Mountain, Waves, Car, Bus, Plane, Train, Bike, Ship, Home,
  Church, Star, Utensils, Bed, BookOpen, GraduationCap,
  Briefcase, Activity, Zap, Wifi, Signal, Radio, Tv, Gamepad2,
  Trophy, Medal, Film, Palette, Camera as PhotoIcon,
  CalendarDays, Bell, Heart, Shield, AlertTriangle, Navigation,
  Compass, Map, Satellite, Eye, Sun, Moon, Cloud, CloudRain,
  Snowflake, Sunrise, Sunset, Rainbow, Leaf, Flower, Bird, Fish,
  Factory, Recycle, Battery, Lightbulb, Fuel, ShoppingCart
} from 'lucide-react';

// Type definitions for comprehensive location data
interface TransportSystem {
  buses: number;
  metro_lines: number;
  train_stations: number;
  bike_stations: number;
  taxi_availability: string;
  traffic_flow: string;
}

interface EducationSystem {
  primary_schools: number;
  secondary_schools: number;
  universities: number;
  libraries: number;
  student_population: number;
}

interface HealthcareSystem {
  hospitals: number;
  clinics: number;
  pharmacies: number;
  emergency_rooms: number;
  bed_capacity: number;
}

interface CommercialSystem {
  shopping_centers: number;
  restaurants: number;
  cafes: number;
  markets: number;
  banks: number;
}

interface EntertainmentSystem {
  theaters: number;
  cinemas: number;
  museums: number;
  parks: number;
  sports_facilities: number;
}

interface ReligiousSystem {
  churches: number;
  mosques: number;
  temples: number;
  synagogues: number;
  other_places: number;
}

interface AccommodationSystem {
  hotels: number;
  hostels: number;
  apartments: number;
  average_price: number;
  occupancy_rate: number;
}

interface NaturalFeatures {
  rivers: string[];
  parks: string[];
  forests: string[];
  lakes: string[];
  mountains: string[];
}

interface TrafficData {
  congestion_level: string;
  average_speed: number;
  accidents: number;
  road_closures: number;
}

interface BusinessActivity {
  market_hours: boolean;
  commercial_activity: string;
  restaurant_occupancy: number;
  retail_sales: number;
}

interface CrowdLevel {
  density: string;
  count: number;
  trend: string;
}

interface LocationEvent {
  name: string;
  location: string;
  attendees: number;
  type: string;
  start_time: string;
}

interface EmergencyServices {
  response_time: number;
  active_calls: number;
  availability: string;
  fire_stations: number;
}

interface UtilitiesData {
  power_grid: string;
  water_supply: string;
  internet_speed: number;
  mobile_coverage: string;
}

interface EnvironmentalData {
  air_quality: number;
  noise_level: number;
  green_space_percentage: number;
  waste_recycling_rate: number;
}

interface SocialMediaData {
  trending_topics: string[];
  check_ins: number;
  sentiment: string;
  activity_level: string;
}

interface EconomicActivity {
  gdp_per_capita: number;
  unemployment_rate: number;
  business_registrations: number;
  tourist_spending: number;
}

interface LocationDetail {
  name: string;
  coordinates: [number, number];
  population: number;
  timezone: string;
  elevation: number;
  climate_zone: string;
  districts: District[];
  neighborhoods: Neighborhood[];
  transport: TransportSystem;
  education: EducationSystem;
  healthcare: HealthcareSystem;
  commercial: CommercialSystem;
  entertainment: EntertainmentSystem;
  religious: ReligiousSystem;
  accommodation: AccommodationSystem;
  natural_features: NaturalFeatures;
}

interface District {
  name: string;
  type: string;
  population: number;
  area_km2: number;
  characteristics: Record<string, any>;
}

interface Neighborhood {
  name: string;
  type: string;
  population: number;
  avg_rent: number;
  safety_rating: number;
  walkability_score: number;
  amenities: string[];
}

interface LiveLocationData {
  weather: WeatherData;
  traffic: TrafficData;
  business_activity: BusinessActivity;
  crowd_levels: Record<string, CrowdLevel>;
  events: LocationEvent[];
  emergency_services: EmergencyServices;
  utilities: UtilitiesData;
  environmental: EnvironmentalData;
  social_media_buzz: SocialMediaData;
  economic_activity: EconomicActivity;
}

interface WeatherData {
  temperature: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_direction: number;
  visibility: number;
  uv_index: number;
  precipitation: number;
  cloud_cover: number;
  weather_condition: string;
  sunrise: string;
  sunset: string;
}

const ComprehensiveLocationExplorer: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('Paris, France');
  const [locationData, setLocationData] = useState<LocationDetail | null>(null);
  const [liveData, setLiveData] = useState<LiveLocationData | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'map' | 'list'>('grid');
  const [timeOfDay, setTimeOfDay] = useState<'dawn' | 'morning' | 'afternoon' | 'evening' | 'night'>('morning');
  const [weatherFilter, setWeatherFilter] = useState<string>('all');

  useEffect(() => {
    // Simulate fetching comprehensive location data
    const fetchLocationData = async () => {
      // This would connect to our World Simulation Engine
      const mockLocationData: LocationDetail = {
        name: selectedLocation,
        coordinates: [48.8566, 2.3522], // Paris coordinates
        population: 2161000,
        timezone: 'Europe/Paris',
        elevation: 35,
        climate_zone: 'Temperate',
        districts: generateDistricts(),
        neighborhoods: generateNeighborhoods(),
        transport: generateTransportSystem(),
        education: generateEducationSystem(),
        healthcare: generateHealthcareSystem(),
        commercial: generateCommercialSystem(),
        entertainment: generateEntertainmentSystem(),
        religious: generateReligiousSystem(),
        accommodation: generateAccommodationSystem(),
        natural_features: generateNaturalFeatures()
      };
      
      setLocationData(mockLocationData);
    };

    const fetchLiveData = async () => {
      const mockLiveData: LiveLocationData = {
        weather: generateWeatherData(),
        traffic: generateTrafficData(),
        business_activity: generateBusinessActivity(),
        crowd_levels: generateCrowdLevels(),
        events: generateLocationEvents(),
        emergency_services: generateEmergencyServices(),
        utilities: generateUtilitiesData(),
        environmental: generateEnvironmentalData(),
        social_media_buzz: generateSocialMediaData(),
        economic_activity: generateEconomicActivity()
      };
      
      setLiveData(mockLiveData);
    };

    fetchLocationData();
    fetchLiveData();

    // Update live data every 5 seconds
    const interval = setInterval(fetchLiveData, 5000);
    return () => clearInterval(interval);
  }, [selectedLocation]);

  // Mock data generators
  const generateDistricts = (): District[] => [
    {
      name: '1st Arrondissement - Louvre',
      type: 'Historic/Cultural',
      population: 16888,
      area_km2: 1.83,
      characteristics: {
        historic_buildings: 45,
        museums: 8,
        luxury_shops: 120,
        tourist_attractions: 15
      }
    },
    {
      name: '8th Arrondissement - Champs-Élysées',
      type: 'Commercial/Business',
      population: 38000,
      area_km2: 3.88,
      characteristics: {
        business_centers: 25,
        luxury_boutiques: 200,
        theaters: 12,
        five_star_hotels: 18
      }
    },
    {
      name: '18th Arrondissement - Montmartre',
      type: 'Artistic/Bohemian',
      population: 190000,
      area_km2: 6.18,
      characteristics: {
        art_studios: 150,
        cafes: 300,
        street_art_sites: 85,
        music_venues: 40
      }
    }
  ];

  const generateNeighborhoods = (): Neighborhood[] => [
    {
      name: 'Le Marais',
      type: 'Historic/Trendy',
      population: 28000,
      avg_rent: 2800,
      safety_rating: 8.5,
      walkability_score: 95,
      amenities: ['Galleries', 'Boutiques', 'Restaurants', 'Museums', 'Parks', 'Metro Stations']
    },
    {
      name: 'Saint-Germain-des-Prés',
      type: 'Intellectual/Literary',
      population: 15000,
      avg_rent: 3200,
      safety_rating: 9.0,
      walkability_score: 98,
      amenities: ['Bookstores', 'Cafes', 'Art Galleries', 'Theaters', 'Boutiques', 'Churches']
    },
    {
      name: 'Belleville',
      type: 'Multicultural/Emerging',
      population: 45000,
      avg_rent: 1800,
      safety_rating: 7.2,
      walkability_score: 85,
      amenities: ['Markets', 'Street Art', 'Ethnic Restaurants', 'Community Centers', 'Parks']
    }
  ];

  const generateTransportSystem = () => ({
    metro_lines: 14,
    metro_stations: 303,
    bus_routes: 347,
    bike_sharing_stations: 1800,
    airports: 3,
    train_stations: 6,
    river_transport: true,
    daily_metro_passengers: 5200000,
    bike_sharing_bikes: 20000,
    taxi_companies: 25,
    ride_sharing_vehicles: 15000
  });

  const generateEducationSystem = () => ({
    primary_schools: 662,
    secondary_schools: 158,
    universities: 17,
    grandes_ecoles: 12,
    vocational_schools: 45,
    libraries: 70,
    research_institutes: 35,
    student_population: 680000,
    international_schools: 28,
    language_schools: 120
  });

  const generateHealthcareSystem = () => ({
    hospitals: 39,
    clinics: 450,
    pharmacies: 1100,
    dental_practices: 2800,
    specialists: 15000,
    emergency_services: 4,
    blood_donation_centers: 15,
    mental_health_centers: 25,
    rehabilitation_centers: 18,
    medical_research_facilities: 12
  });

  const generateCommercialSystem = () => ({
    shopping_malls: 8,
    department_stores: 12,
    supermarkets: 250,
    markets: 85,
    restaurants: 40000,
    cafes: 9000,
    bars: 4500,
    banks: 680,
    atms: 2500,
    gas_stations: 150,
    luxury_boutiques: 800,
    bookstores: 400
  });

  const generateEntertainmentSystem = () => ({
    theaters: 130,
    cinemas: 95,
    museums: 153,
    art_galleries: 400,
    concert_halls: 25,
    nightclubs: 200,
    parks: 421,
    gardens: 100,
    sports_stadiums: 8,
    sports_centers: 180,
    swimming_pools: 39,
    amusement_parks: 2
  });

  const generateReligiousSystem = () => ({
    churches: 195,
    mosques: 75,
    synagogues: 35,
    temples: 15,
    other_religious_sites: 45,
    religious_festivals: 25,
    pilgrimage_sites: 8,
    religious_schools: 120
  });

  const generateAccommodationSystem = () => ({
    luxury_hotels: 85,
    mid_range_hotels: 350,
    budget_hotels: 250,
    hostels: 95,
    vacation_rentals: 65000,
    bed_and_breakfasts: 150,
    total_hotel_rooms: 155000,
    average_occupancy: 78,
    boutique_hotels: 45
  });

  const generateNaturalFeatures = () => ({
    rivers: [
      { name: 'Seine River', length_km: 13, recreational_activities: ['River Cruise', 'Walking Path', 'Fishing'] }
    ],
    parks: [
      { name: 'Luxembourg Gardens', area_hectares: 25, facilities: ['Playground', 'Tennis Courts', 'Pond'] },
      { name: 'Tuileries Garden', area_hectares: 25.5, facilities: ['Sculptures', 'Fountains', 'Museum'] },
      { name: 'Bois de Vincennes', area_hectares: 995, facilities: ['Lake', 'Zoo', 'Cycling Paths'] }
    ],
    forests: [
      { name: 'Bois de Boulogne', area_hectares: 846, tree_species: ['Oak', 'Beech', 'Chestnut'] }
    ]
  });

  const generateWeatherData = (): WeatherData => ({
    temperature: Math.round(Math.random() * 25 + 5),
    feels_like: Math.round(Math.random() * 25 + 5),
    humidity: Math.round(Math.random() * 40 + 40),
    pressure: Math.round(Math.random() * 50 + 1000),
    wind_speed: Math.round(Math.random() * 20),
    wind_direction: Math.round(Math.random() * 360),
    visibility: Math.round(Math.random() * 15 + 5),
    uv_index: Math.round(Math.random() * 10),
    precipitation: Math.round(Math.random() * 5),
    cloud_cover: Math.round(Math.random() * 100),
    weather_condition: ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
    sunrise: '07:30',
    sunset: '19:45'
  });

  const generateTrafficData = () => ({
    overall_congestion: ['Light', 'Moderate', 'Heavy'][Math.floor(Math.random() * 3)],
    average_speed_kmh: Math.round(Math.random() * 30 + 20),
    incidents: Math.round(Math.random() * 10),
    road_closures: Math.round(Math.random() * 3),
    construction_zones: Math.round(Math.random() * 15 + 5),
    parking_availability: Math.round(Math.random() * 40 + 40),
    fuel_prices: {
      gasoline: (Math.random() * 0.5 + 1.5).toFixed(2),
      diesel: (Math.random() * 0.4 + 1.4).toFixed(2)
    }
  });

  const generateBusinessActivity = () => ({
    activity_level: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
    open_businesses_percentage: Math.round(Math.random() * 30 + 70),
    office_occupancy: Math.round(Math.random() * 40 + 60),
    retail_foot_traffic: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
    restaurant_bookings: ['Very High', 'High', 'Medium'][Math.floor(Math.random() * 3)],
    delivery_activity: ['Very High', 'High', 'Medium'][Math.floor(Math.random() * 3)]
  });

  const generateCrowdLevels = () => ({
    'Tourist Areas': { level: 'High', estimated_people: Math.round(Math.random() * 5000 + 2000), wait_times: `${Math.round(Math.random() * 30 + 10)} minutes` },
    'Shopping Districts': { level: 'Very High', estimated_people: Math.round(Math.random() * 8000 + 3000), wait_times: `${Math.round(Math.random() * 45 + 15)} minutes` },
    'Parks': { level: 'Medium', estimated_people: Math.round(Math.random() * 2000 + 500), wait_times: `${Math.round(Math.random() * 15 + 5)} minutes` },
    'Transportation Hubs': { level: 'High', estimated_people: Math.round(Math.random() * 10000 + 5000), wait_times: `${Math.round(Math.random() * 20 + 10)} minutes` }
  });

  const generateLocationEvents = () => [
    { name: 'Art Exhibition Opening', location: 'Louvre Museum', attendance: 2500, status: 'Ongoing' },
    { name: 'Street Music Festival', location: 'Montmartre', attendance: 8000, status: 'Starting Soon' },
    { name: 'Fashion Week Showcase', location: 'Champs-Élysées', attendance: 1200, status: 'VIP Only' }
  ];

  const generateEmergencyServices = () => ({
    fire_department: { active_calls: Math.round(Math.random() * 5), response_time: `${Math.round(Math.random() * 8 + 6)} minutes` },
    police: { active_incidents: Math.round(Math.random() * 15 + 5), response_time: `${Math.round(Math.random() * 12 + 8)} minutes` },
    ambulance: { active_calls: Math.round(Math.random() * 20 + 10), response_time: `${Math.round(Math.random() * 10 + 8)} minutes` }
  });

  const generateUtilitiesData = () => ({
    electricity: { grid_load: Math.round(Math.random() * 30 + 70), outages: Math.round(Math.random() * 3) },
    water: { pressure: Math.round(Math.random() * 20 + 50), quality: 'Excellent' },
    internet: { average_speed_mbps: Math.round(Math.random() * 200 + 100), uptime: 99.8 },
    waste: { collection_efficiency: Math.round(Math.random() * 10 + 90), recycling_rate: Math.round(Math.random() * 20 + 60) }
  });

  const generateEnvironmentalData = () => ({
    air_quality: { aqi: Math.round(Math.random() * 80 + 20), quality: 'Good' },
    noise_levels: { average_db: Math.round(Math.random() * 20 + 50), peak_db: Math.round(Math.random() * 30 + 70) },
    green_space_coverage: Math.round(Math.random() * 20 + 15),
    biodiversity_index: (Math.random() * 2 + 7).toFixed(1)
  });

  const generateSocialMediaData = () => ({
    trending_hashtags: ['#ParisLife', '#CityOfLights', '#ParisMoments'],
    mentions_per_hour: Math.round(Math.random() * 5000 + 2000),
    sentiment_score: (Math.random() * 2 + 7).toFixed(1),
    popular_locations: ['Eiffel Tower', 'Louvre', 'Notre-Dame']
  });

  const generateEconomicActivity = () => ({
    gdp_contribution: `${(Math.random() * 5 + 20).toFixed(1)}%`,
    employment_rate: `${(Math.random() * 5 + 92).toFixed(1)}%`,
    business_creation_rate: Math.round(Math.random() * 500 + 200),
    tourism_revenue_daily: `€${(Math.random() * 50 + 100).toFixed(1)}M`
  });

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getWeatherIcon = (condition: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'Clear': <Sun className="w-6 h-6 text-yellow-400" />,
      'Partly Cloudy': <Cloud className="w-6 h-6 text-gray-400" />,
      'Cloudy': <Cloud className="w-6 h-6 text-gray-500" />,
      'Light Rain': <CloudRain className="w-6 h-6 text-blue-400" />
    };
    return iconMap[condition] || <Sun className="w-6 h-6 text-yellow-400" />;
  };

  const OverviewTab: React.FC = () => (
    <div className="space-y-6">
      {/* Location Header */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-6 rounded-xl">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{locationData?.name}</h2>
            <div className="flex items-center space-x-4 text-gray-300">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{locationData?.coordinates.join(', ')}</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                <span>{formatNumber(locationData?.population || 0)} people</span>
              </div>
              <div className="flex items-center">
                <Mountain className="w-5 h-5 mr-2" />
                <span>{locationData?.elevation}m elevation</span>
              </div>
            </div>
          </div>
          {liveData?.weather && (
            <div className="text-right">
              <div className="flex items-center justify-end mb-2">
                {getWeatherIcon(liveData.weather.weather_condition)}
                <span className="text-3xl font-bold text-white ml-2">{liveData.weather.temperature}°C</span>
              </div>
              <div className="text-sm text-gray-300">Feels like {liveData.weather.feels_like}°C</div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-gray-900 p-4 rounded-lg">
          <School className="w-6 h-6 text-blue-400 mb-2" />
          <div className="text-sm text-gray-400">Schools</div>
          <div className="text-xl font-bold text-white">{locationData?.education.primary_schools}</div>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg">
          <Hospital className="w-6 h-6 text-red-400 mb-2" />
          <div className="text-sm text-gray-400">Hospitals</div>
          <div className="text-xl font-bold text-white">{locationData?.healthcare.hospitals}</div>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg">
          <ShoppingBag className="w-6 h-6 text-green-400 mb-2" />
          <div className="text-sm text-gray-400">Restaurants</div>
          <div className="text-xl font-bold text-white">{formatNumber(locationData?.commercial.restaurants || 0)}</div>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg">
          <Drama className="w-6 h-6 text-purple-400 mb-2" />
          <div className="text-sm text-gray-400">Museums</div>
          <div className="text-xl font-bold text-white">{locationData?.entertainment.museums}</div>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg">
          <Bus className="w-6 h-6 text-orange-400 mb-2" />
          <div className="text-sm text-gray-400">Metro Stations</div>
          <div className="text-xl font-bold text-white">{locationData?.transport.metro_stations}</div>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg">
          <TreePine className="w-6 h-6 text-green-500 mb-2" />
          <div className="text-sm text-gray-400">Parks</div>
          <div className="text-xl font-bold text-white">{locationData?.entertainment.parks}</div>
        </div>
      </div>

      {/* Live Activity Dashboard */}
      {liveData && (
        <div className="bg-gray-900 p-6 rounded-xl">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Activity className="w-6 h-6 mr-2 text-green-400" />
            Live Activity Dashboard
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-black/50 p-4 rounded-lg">
              <Car className="w-5 h-5 text-red-400 mb-2" />
              <div className="text-sm text-gray-400">Traffic</div>
              <div className="font-bold text-white">{liveData.traffic.overall_congestion}</div>
            </div>
            <div className="bg-black/50 p-4 rounded-lg">
              <Building className="w-5 h-5 text-blue-400 mb-2" />
              <div className="text-sm text-gray-400">Business Activity</div>
              <div className="font-bold text-white">{liveData.business_activity.activity_level}</div>
            </div>
            <div className="bg-black/50 p-4 rounded-lg">
              <Leaf className="w-5 h-5 text-green-400 mb-2" />
              <div className="text-sm text-gray-400">Air Quality</div>
              <div className="font-bold text-white">{liveData.environmental.air_quality.quality}</div>
            </div>
            <div className="bg-black/50 p-4 rounded-lg">
              <Zap className="w-5 h-5 text-yellow-400 mb-2" />
              <div className="text-sm text-gray-400">Grid Load</div>
              <div className="font-bold text-white">{liveData.utilities.electricity.grid_load}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const DistrictsTab: React.FC = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white mb-4">City Districts</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locationData?.districts.map((district, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer"
            onClick={() => setSelectedDistrict(district.name)}
          >
            <h4 className="text-xl font-bold text-white mb-3">{district.name}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-white">{district.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Population:</span>
                <span className="text-white">{formatNumber(district.population)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Area:</span>
                <span className="text-white">{district.area_km2} km²</span>
              </div>
            </div>
            
            {/* District Characteristics */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(district.characteristics).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-500 capitalize">{key.replace('_', ' ')}:</span>
                    <span className="text-gray-300">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const NeighborhoodsTab: React.FC = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white mb-4">Neighborhoods</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {locationData?.neighborhoods.map((neighborhood, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-900 p-6 rounded-xl border border-gray-700"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-xl font-bold text-white">{neighborhood.name}</h4>
                <p className="text-gray-400">{neighborhood.type}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-400">€{neighborhood.avg_rent}</div>
                <div className="text-xs text-gray-400">avg rent</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-400">Population</div>
                <div className="font-bold text-white">{formatNumber(neighborhood.population)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Safety Rating</div>
                <div className="font-bold text-white">{neighborhood.safety_rating}/10</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Walkability</div>
                <div className="font-bold text-white">{neighborhood.walkability_score}/100</div>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-400 mb-2">Amenities</div>
              <div className="flex flex-wrap gap-1">
                {neighborhood.amenities.map((amenity, i) => (
                  <span key={i} className="bg-blue-900/30 text-blue-300 px-2 py-1 rounded text-xs">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const TransportTab: React.FC = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white mb-4">Transportation System</h3>
      
      {locationData?.transport && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-900/20 p-6 rounded-xl border border-blue-500/20">
            <div className="flex items-center mb-4">
              <Train className="w-8 h-8 text-blue-400 mr-3" />
              <h4 className="text-xl font-bold text-white">Metro System</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Lines:</span>
                <span className="text-white font-bold">{locationData.transport.metro_lines}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Stations:</span>
                <span className="text-white font-bold">{locationData.transport.metro_stations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Daily Passengers:</span>
                <span className="text-white font-bold">{formatNumber(locationData.transport.daily_metro_passengers)}</span>
              </div>
            </div>
          </div>

          <div className="bg-green-900/20 p-6 rounded-xl border border-green-500/20">
            <div className="flex items-center mb-4">
              <Bus className="w-8 h-8 text-green-400 mr-3" />
              <h4 className="text-xl font-bold text-white">Bus Network</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Routes:</span>
                <span className="text-white font-bold">{locationData.transport.bus_routes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Coverage:</span>
                <span className="text-white font-bold">City-wide</span>
              </div>
            </div>
          </div>

          <div className="bg-purple-900/20 p-6 rounded-xl border border-purple-500/20">
            <div className="flex items-center mb-4">
              <Bike className="w-8 h-8 text-purple-400 mr-3" />
              <h4 className="text-xl font-bold text-white">Bike Sharing</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Stations:</span>
                <span className="text-white font-bold">{locationData.transport.bike_sharing_stations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Bikes:</span>
                <span className="text-white font-bold">{formatNumber(locationData.transport.bike_sharing_bikes)}</span>
              </div>
            </div>
          </div>

          <div className="bg-orange-900/20 p-6 rounded-xl border border-orange-500/20">
            <div className="flex items-center mb-4">
              <Plane className="w-8 h-8 text-orange-400 mr-3" />
              <h4 className="text-xl font-bold text-white">Air Transport</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Airports:</span>
                <span className="text-white font-bold">{locationData.transport.airports}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-white font-bold">International</span>
              </div>
            </div>
          </div>

          <div className="bg-cyan-900/20 p-6 rounded-xl border border-cyan-500/20">
            <div className="flex items-center mb-4">
              <Ship className="w-8 h-8 text-cyan-400 mr-3" />
              <h4 className="text-xl font-bold text-white">River Transport</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Available:</span>
                <span className="text-white font-bold">{locationData.transport.river_transport ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-white font-bold">Tourist & Commuter</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-900/20 p-6 rounded-xl border border-yellow-500/20">
            <div className="flex items-center mb-4">
              <Car className="w-8 h-8 text-yellow-400 mr-3" />
              <h4 className="text-xl font-bold text-white">Road Transport</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Taxi Companies:</span>
                <span className="text-white font-bold">{locationData.transport.taxi_companies}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Ride Share:</span>
                <span className="text-white font-bold">{formatNumber(locationData.transport.ride_sharing_vehicles)} vehicles</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 p-6 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center">
            <MapPin className="w-10 h-10 mr-4 text-blue-400" />
            Comprehensive Location Explorer
          </h1>
          
          {/* Tab Navigation */}
          <div className="flex space-x-2">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'districts', label: 'Districts', icon: Building },
              { id: 'neighborhoods', label: 'Neighborhoods', icon: Home },
              { id: 'transport', label: 'Transport', icon: Bus },
              { id: 'services', label: 'Services', icon: Hospital },
              { id: 'culture', label: 'Culture', icon: Drama },
              { id: 'nature', label: 'Nature', icon: TreePine }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm transition-all ${
                  activeTab === id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && <OverviewTab key="overview" />}
          {activeTab === 'districts' && <DistrictsTab key="districts" />}
          {activeTab === 'neighborhoods' && <NeighborhoodsTab key="neighborhoods" />}
          {activeTab === 'transport' && <TransportTab key="transport" />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ComprehensiveLocationExplorer;
