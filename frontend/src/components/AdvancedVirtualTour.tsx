import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings,
  Layers,
  Users,
  Camera,
  Zap,
  MapPin,
  Clock,
  Thermometer,
  Wind,
  Eye,
  Activity,
  Headphones,
  Share2,
  Heart,
  MessageCircle,
  RotateCcw
} from 'lucide-react'
import ImmersiveViewport from './ImmersiveViewport'
import InteractiveStreetView from './InteractiveStreetView'

interface AdvancedVirtualTourProps {
  locationId: string
  initialLocation: {
    latitude: number
    longitude: number
    name: string
    country: string
  }
}

interface TourMode {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  features: string[]
}

interface LiveStream {
  id: string
  title: string
  type: 'webcam' | 'event' | 'drone'
  url: string
  viewers: number
  quality: string
  isActive: boolean
}

interface RealTimeData {
  weather: {
    temperature: number
    condition: string
    humidity: number
    windSpeed: number
  }
  crowd: {
    density: string
    totalPeople: number
    activities: string[]
  }
  atmosphere: {
    noise_level: number
    air_quality: number
    visibility: number
  }
  events: Array<{
    name: string
    type: string
    participants: number
    status: 'live' | 'upcoming'
  }>
}

const AdvancedVirtualTour: React.FC<AdvancedVirtualTourProps> = ({ 
  locationId, 
  initialLocation 
}) => {
  const [currentMode, setCurrentMode] = useState<string>('immersive')
  const [isPlaying, setIsPlaying] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null)
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null)
  const [showControls, setShowControls] = useState(true)
  const [socialInteractions, setSocialInteractions] = useState({
    likes: 0,
    shares: 0,
    comments: []
  })
  
  const containerRef = useRef<HTMLDivElement>(null)
  const websocketRef = useRef<WebSocket | null>(null)

  const tourModes: TourMode[] = [
    {
      id: 'immersive',
      name: 'Immersive View',
      description: 'Live data overlay with real-time analysis',
      icon: Eye,
      features: ['Live webcams', 'Crowd analysis', 'Environmental data', 'Real-time events']
    },
    {
      id: 'street_view',
      name: 'Interactive Street View',
      description: 'Navigate through streets with live overlays',
      icon: MapPin,
      features: ['Street navigation', 'People tracking', 'Interactive markers', 'Live POIs']
    },
    {
      id: 'drone_view',
      name: 'Aerial Perspective',
      description: 'Bird\'s eye view with drone footage',
      icon: Camera,
      features: ['Drone streams', 'Traffic analysis', 'Area overview', 'Movement patterns']
    },
    {
      id: 'social_layer',
      name: 'Social Experience',
      description: 'Live social media and community interactions',
      icon: Users,
      features: ['Social posts', 'Live chat', 'User annotations', 'Shared experiences']
    }
  ]

  // Initialize WebSocket for real-time data
  useEffect(() => {
    const connectWebSocket = () => {
      const wsUrl = `ws://localhost:8003/ws/live-feed/${locationId}`
      websocketRef.current = new WebSocket(wsUrl)

      websocketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          updateRealTimeData(data)
        } catch (error) {
          console.error('Error parsing WebSocket data:', error)
        }
      }

      websocketRef.current.onclose = () => {
        // Reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000)
      }
    }

    connectWebSocket()

    return () => {
      if (websocketRef.current) {
        websocketRef.current.close()
      }
    }
  }, [locationId])

  const updateRealTimeData = (data: any) => {
    setRealTimeData({
      weather: {
        temperature: data.environment?.humidity || 20,
        condition: data.environment?.weather || 'clear',
        humidity: data.environment?.humidity || 60,
        windSpeed: data.traffic?.wind_speed || 5
      },
      crowd: {
        density: data.traffic?.traffic_level || 'moderate',
        totalPeople: data.traffic?.crowd_density || 25,
        activities: data.traffic?.events_happening?.map((e: any) => e.name) || []
      },
      atmosphere: {
        noise_level: data.environment?.noise_level || 45,
        air_quality: data.environment?.air_quality?.aqi || 50,
        visibility: data.environment?.visibility || 10
      },
      events: data.events || []
    })
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
    setIsFullscreen(!isFullscreen)
  }

  const handleSocialInteraction = (type: 'like' | 'share' | 'comment', data?: any) => {
    setSocialInteractions(prev => ({
      ...prev,
      [type === 'like' ? 'likes' : type === 'share' ? 'shares' : 'comments']: 
        type === 'comment' 
          ? [...prev.comments, data]
          : prev[type === 'like' ? 'likes' : 'shares'] + 1
    }))
  }

  const LiveDataPanel: React.FC = () => (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="absolute top-4 right-4 w-80 max-h-[calc(100vh-2rem)] overflow-y-auto bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20"
    >
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="text-green-500" size={20} />
          <h3 className="font-bold text-gray-800">Live Data</h3>
          <div className="ml-auto w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        </div>

        {/* Weather Conditions */}
        {realTimeData?.weather && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Thermometer size={16} />
              Weather
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Temp:</span>
                <span className="ml-1 font-medium">{realTimeData.weather.temperature}°C</span>
              </div>
              <div>
                <span className="text-gray-600">Humidity:</span>
                <span className="ml-1 font-medium">{realTimeData.weather.humidity}%</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Condition:</span>
                <span className="ml-1 font-medium capitalize">{realTimeData.weather.condition}</span>
              </div>
            </div>
          </div>
        )}

        {/* Crowd Analysis */}
        {realTimeData?.crowd && (
          <div className="mb-4 p-3 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
              <Users size={16} />
              Crowd Analysis
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">People:</span>
                <span className="font-medium">{realTimeData.crowd.totalPeople}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Density:</span>
                <span className={`font-medium capitalize ${
                  realTimeData.crowd.density === 'high' ? 'text-red-600' :
                  realTimeData.crowd.density === 'moderate' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {realTimeData.crowd.density}
                </span>
              </div>
              {realTimeData.crowd.activities.length > 0 && (
                <div>
                  <span className="text-gray-600">Activities:</span>
                  <div className="mt-1">
                    {realTimeData.crowd.activities.slice(0, 3).map((activity, index) => (
                      <span key={index} className="inline-block bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Environmental Data */}
        {realTimeData?.atmosphere && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
              <Wind size={16} />
              Environment
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Air Quality:</span>
                <span className={`font-medium ${
                  realTimeData.atmosphere.air_quality <= 50 ? 'text-green-600' :
                  realTimeData.atmosphere.air_quality <= 100 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {realTimeData.atmosphere.air_quality} AQI
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Noise:</span>
                <span className="font-medium">{realTimeData.atmosphere.noise_level} dB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Visibility:</span>
                <span className="font-medium">{realTimeData.atmosphere.visibility} km</span>
              </div>
            </div>
          </div>
        )}

        {/* Live Events */}
        {realTimeData?.events && realTimeData.events.length > 0 && (
          <div className="mb-4 p-3 bg-orange-50 rounded-lg">
            <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
              <Zap size={16} />
              Live Events
            </h4>
            <div className="space-y-2">
              {realTimeData.events.slice(0, 3).map((event, index) => (
                <div key={index} className="bg-white p-2 rounded border border-orange-200">
                  <div className="font-medium text-sm text-gray-800">{event.name}</div>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span className="capitalize">{event.type}</span>
                    <span>{event.participants} people</span>
                  </div>
                  {event.status === 'live' && (
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-red-600 font-medium">LIVE</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )

  const ControlInterface: React.FC = () => (
    <AnimatePresence>
      {showControls && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="absolute bottom-4 left-4 right-4"
        >
          {/* Mode Selector */}
          <div className="mb-4 flex justify-center">
            <div className="bg-black/80 backdrop-blur-sm rounded-full p-2 flex gap-2">
              {tourModes.map((mode) => {
                const Icon = mode.icon
                return (
                  <button
                    key={mode.id}
                    onClick={() => setCurrentMode(mode.id)}
                    className={`p-3 rounded-full transition-all ${
                      currentMode === mode.id
                        ? 'bg-white text-black'
                        : 'text-white hover:bg-white/20'
                    }`}
                    title={mode.name}
                  >
                    <Icon size={20} />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex justify-between items-end">
            {/* Left Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-4 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
              >
                {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
            </div>

            {/* Center Info */}
            <div className="bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full">
              <div className="text-center">
                <div className="font-semibold">{initialLocation.name}</div>
                <div className="text-sm opacity-75">{initialLocation.country}</div>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleFullscreen}
                className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
              >
                <Maximize size={20} />
              </button>
              
              <button
                onClick={() => setShowControls(!showControls)}
                className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  const SocialInterface: React.FC = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-4 right-4 flex flex-col gap-2"
    >
      <button
        onClick={() => handleSocialInteraction('like')}
        className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors group"
      >
        <Heart size={20} className="group-hover:text-red-500 transition-colors" />
        {socialInteractions.likes > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {socialInteractions.likes}
          </span>
        )}
      </button>
      
      <button
        onClick={() => handleSocialInteraction('share')}
        className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors group"
      >
        <Share2 size={20} className="group-hover:text-blue-500 transition-colors" />
      </button>
      
      <button
        onClick={() => handleSocialInteraction('comment', { text: 'Amazing view!', user: 'Anonymous' })}
        className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors group"
      >
        <MessageCircle size={20} className="group-hover:text-green-500 transition-colors" />
      </button>
    </motion.div>
  )

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full bg-black overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
    >
      {/* Main Content Based on Mode */}
      <div className="w-full h-full">
        {currentMode === 'immersive' && (
          <ImmersiveViewport 
            locationId={locationId}
            onDataUpdate={(data) => updateRealTimeData(data)}
          />
        )}
        
        {currentMode === 'street_view' && (
          <InteractiveStreetView 
            location={initialLocation}
            onLocationChange={(newLocation) => {
              // Handle location changes
              console.log('Location changed:', newLocation)
            }}
          />
        )}
        
        {currentMode === 'drone_view' && (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
            <div className="text-center text-white">
              <Camera size={64} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-bold mb-2">Aerial View</h3>
              <p className="text-lg opacity-75">Drone footage coming soon...</p>
            </div>
          </div>
        )}
        
        {currentMode === 'social_layer' && (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-900 to-purple-900">
            <div className="text-center text-white">
              <Users size={64} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-bold mb-2">Social Experience</h3>
              <p className="text-lg opacity-75">Social features coming soon...</p>
            </div>
          </div>
        )}
      </div>

      {/* Live Data Panel */}
      <LiveDataPanel />

      {/* Control Interface */}
      <ControlInterface />

      {/* Social Interface */}
      <SocialInterface />

      {/* Hide Controls Toggle */}
      {!showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
        >
          <Eye size={16} />
        </button>
      )}

      {/* Loading Overlay */}
      {!realTimeData && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Connecting to Live Data
            </h3>
            <p className="text-gray-600">
              Establishing real-time connection to {initialLocation.name}...
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedVirtualTour
