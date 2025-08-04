import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Eye, 
  Users, 
  Waves, 
  Thermometer, 
  Wind, 
  Camera, 
  Radio,
  Activity,
  MapPin,
  Clock,
  Zap,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text, Sphere, Box } from '@react-three/drei'

interface LiveDataProps {
  locationId: string
  onDataUpdate?: (data: any) => void
}

interface LiveWebcam {
  id: string
  title: string
  live_url: string
  player_url: string
  status: string
  views: number
  updated: string
}

interface LiveEvent {
  id: string
  location: any
  event_type: string
  description: string
  participants: number
  timestamp: string
  image_url: string
  live_stream_url?: string
}

interface CrowdData {
  total_people_estimate: number
  crowd_density: string
  movement_patterns: any
  demographics: any
  popular_activities: Array<{activity: string, participants: number}>
}

interface EnvironmentalData {
  air_quality: {aqi: number, level: string}
  uv_index: number
  noise_level: number
  visibility: number
  humidity: number
  timestamp: string
}

const ImmersiveViewport: React.FC<LiveDataProps> = ({ locationId, onDataUpdate }) => {
  const [liveData, setLiveData] = useState<any>(null)
  const [selectedWebcam, setSelectedWebcam] = useState<LiveWebcam | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [viewMode, setViewMode] = useState<'overview' | 'immersive' | '3d'>('overview')
  const [crowdData, setCrowdData] = useState<CrowdData | null>(null)
  const [environmentData, setEnvironmentData] = useState<EnvironmentalData | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const websocketRef = useRef<WebSocket | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioContext = useRef<AudioContext | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize WebSocket connection for live data
  useEffect(() => {
    const connectWebSocket = () => {
      const wsUrl = `ws://localhost:8003/ws/live-feed/${locationId}`
      websocketRef.current = new WebSocket(wsUrl)

      websocketRef.current.onopen = () => {
        console.log('WebSocket connected for live data')
        setIsStreaming(true)
      }

      websocketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setLiveData(data)
          onDataUpdate?.(data)
          
          // Update specific data states
          if (data.traffic) {
            setCrowdData({
              total_people_estimate: data.traffic.crowd_density,
              crowd_density: data.traffic.traffic_level,
              movement_patterns: data.traffic.popular_spots,
              demographics: {},
              popular_activities: data.traffic.events_happening || []
            })
          }
          
          if (data.environment) {
            setEnvironmentData(data.environment)
          }
          
        } catch (error) {
          console.error('Error parsing WebSocket data:', error)
        }
      }

      websocketRef.current.onclose = () => {
        console.log('WebSocket disconnected')
        setIsStreaming(false)
        // Attempt to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000)
      }

      websocketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    }

    connectWebSocket()

    return () => {
      if (websocketRef.current) {
        websocketRef.current.close()
      }
    }
  }, [locationId, onDataUpdate])

  // Initialize audio context for ambient sounds
  useEffect(() => {
    if (audioEnabled && !audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }, [audioEnabled])

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
    setIsFullscreen(!isFullscreen)
  }

  const LiveWebcamFeed: React.FC<{ webcam: LiveWebcam }> = ({ webcam }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative bg-black rounded-lg overflow-hidden aspect-video"
    >
      <img
        src={webcam.live_url}
        alt={webcam.title}
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/placeholder-webcam.jpg'
        }}
      />
      
      {/* Live indicator */}
      <div className="absolute top-2 left-2 flex items-center gap-2">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        <span className="text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
          LIVE
        </span>
      </div>
      
      {/* Webcam info */}
      <div className="absolute bottom-2 left-2 right-2">
        <div className="bg-black/70 text-white p-2 rounded">
          <h4 className="font-medium text-sm">{webcam.title}</h4>
          <div className="flex items-center gap-4 text-xs text-gray-300 mt-1">
            <span className="flex items-center gap-1">
              <Eye size={12} />
              {webcam.views.toLocaleString()}
            </span>
            <span>Updated: {new Date(webcam.updated).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
      
      {/* Expand button */}
      <button
        onClick={() => setSelectedWebcam(webcam)}
        className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
      >
        <Maximize size={16} />
      </button>
    </motion.div>
  )

  const CrowdVisualization: React.FC<{ data: CrowdData }> = ({ data }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-4 rounded-xl border border-blue-200/20"
    >
      <div className="flex items-center gap-2 mb-3">
        <Users className="text-blue-500" size={20} />
        <h3 className="font-semibold text-gray-800">Live Crowd Analysis</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {data.total_people_estimate.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">People Present</div>
        </div>
        
        <div className="text-center">
          <div className={`text-2xl font-bold ${
            data.crowd_density === 'high' ? 'text-red-500' :
            data.crowd_density === 'moderate' ? 'text-yellow-500' : 'text-green-500'
          }`}>
            {data.crowd_density.toUpperCase()}
          </div>
          <div className="text-sm text-gray-600">Density Level</div>
        </div>
      </div>
      
      {data.popular_activities.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-gray-700 mb-2">Popular Activities</h4>
          <div className="space-y-2">
            {data.popular_activities.map((activity, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="capitalize">{activity.activity}</span>
                <span className="font-medium text-blue-600">
                  {activity.participants} people
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )

  const EnvironmentalPanel: React.FC<{ data: EnvironmentalData }> = ({ data }) => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gradient-to-br from-green-500/10 to-blue-500/10 p-4 rounded-xl border border-green-200/20"
    >
      <div className="flex items-center gap-2 mb-3">
        <Activity className="text-green-500" size={20} />
        <h3 className="font-semibold text-gray-800">Environmental Conditions</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Wind className="text-blue-500" size={16} />
          <div>
            <div className="font-medium">Air Quality</div>
            <div className={`text-xs ${
              data.air_quality.level === 'good' ? 'text-green-600' :
              data.air_quality.level === 'moderate' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              AQI {data.air_quality.aqi} - {data.air_quality.level}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Thermometer className="text-orange-500" size={16} />
          <div>
            <div className="font-medium">UV Index</div>
            <div className="text-xs text-gray-600">{data.uv_index}/10</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Volume2 className="text-purple-500" size={16} />
          <div>
            <div className="font-medium">Noise Level</div>
            <div className="text-xs text-gray-600">{data.noise_level} dB</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Eye className="text-blue-500" size={16} />
          <div>
            <div className="font-medium">Visibility</div>
            <div className="text-xs text-gray-600">{data.visibility} km</div>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const LiveEventCard: React.FC<{ event: LiveEvent }> = ({ event }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200"
    >
      <div className="relative">
        <img
          src={event.image_url}
          alt={event.description}
          className="w-full h-32 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-event.jpg'
          }}
        />
        
        {event.live_stream_url && (
          <div className="absolute top-2 right-2">
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              STREAMING
            </span>
          </div>
        )}
      </div>
      
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="text-gray-500" size={14} />
          <span className="text-xs text-gray-600">
            {event.location.name}
          </span>
        </div>
        
        <h4 className="font-medium text-gray-800 mb-1 text-sm">
          {event.description}
        </h4>
        
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <Users size={12} />
            {event.participants} people
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {new Date(event.timestamp).toLocaleTimeString()}
          </span>
        </div>
        
        {event.live_stream_url && (
          <button className="w-full mt-2 bg-red-500 text-white text-xs py-2 rounded hover:bg-red-600 transition-colors flex items-center justify-center gap-1">
            <Play size={12} />
            Watch Live
          </button>
        )}
      </div>
    </motion.div>
  )

  const ThreeDVisualization: React.FC = () => {
    const { scene } = useThree()
    
    useFrame((state) => {
      // Animate the 3D scene based on live data
      if (crowdData) {
        const crowdIntensity = crowdData.total_people_estimate / 500
        scene.rotation.y += crowdIntensity * 0.01
      }
    })

    return (
      <>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        {/* Represent crowd as floating spheres */}
        {crowdData && crowdData.popular_activities.map((activity, index) => (
          <Sphere
            key={index}
            position={[
              Math.sin(index) * 5,
              Math.cos(index) * 3,
              index * 2
            ]}
            args={[0.5, 16, 16]}
          >
            <meshStandardMaterial 
              color={activity.participants > 50 ? '#ff6b6b' : '#4ecdc4'} 
              transparent
              opacity={0.7}
            />
          </Sphere>
        ))}
        
        {/* Environmental data visualization */}
        {environmentData && (
          <Box position={[0, 0, 0]} args={[2, 2, 2]}>
            <meshStandardMaterial 
              color={environmentData.air_quality.level === 'good' ? '#4caf50' : '#ff9800'} 
              transparent
              opacity={0.3}
            />
          </Box>
        )}
        
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'w-full'}`}
    >
      {/* Control Panel */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <button
          onClick={() => setViewMode('overview')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'overview' 
              ? 'bg-blue-500 text-white' 
              : 'bg-white/90 text-gray-700 hover:bg-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setViewMode('immersive')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'immersive' 
              ? 'bg-blue-500 text-white' 
              : 'bg-white/90 text-gray-700 hover:bg-white'
          }`}
        >
          Immersive
        </button>
        <button
          onClick={() => setViewMode('3d')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === '3d' 
              ? 'bg-blue-500 text-white' 
              : 'bg-white/90 text-gray-700 hover:bg-white'
          }`}
        >
          3D View
        </button>
      </div>

      {/* Status Indicators */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
          isStreaming ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
        }`}>
          <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-white animate-pulse' : 'bg-white'}`}></div>
          {isStreaming ? 'LIVE' : 'OFFLINE'}
        </div>
        
        <button
          onClick={() => setAudioEnabled(!audioEnabled)}
          className="p-2 bg-white/90 text-gray-700 rounded-lg hover:bg-white transition-colors"
        >
          {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
        
        <button
          onClick={toggleFullscreen}
          className="p-2 bg-white/90 text-gray-700 rounded-lg hover:bg-white transition-colors"
        >
          <Maximize size={20} />
        </button>
      </div>

      {/* Main Content */}
      <div className="h-full">
        {viewMode === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 h-full overflow-y-auto">
            {/* Live Webcams */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Camera className="text-blue-500" />
                Live Webcam Feeds
              </h2>
              
              {liveData?.webcams && liveData.webcams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {liveData.webcams.slice(0, 4).map((webcam: LiveWebcam) => (
                    <LiveWebcamFeed key={webcam.id} webcam={webcam} />
                  ))}
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <Camera className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600">Loading live webcam feeds...</p>
                </div>
              )}
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Crowd Data */}
              {crowdData && <CrowdVisualization data={crowdData} />}
              
              {/* Environmental Data */}
              {environmentData && <EnvironmentalPanel data={environmentData} />}
              
              {/* Live Events */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Zap className="text-yellow-500" size={20} />
                  Live Events
                </h3>
                
                {liveData?.events && liveData.events.length > 0 ? (
                  <div className="space-y-3">
                    {liveData.events.map((event: LiveEvent) => (
                      <LiveEventCard key={event.id} event={event} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-600 text-sm">
                    No live events detected
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'immersive' && selectedWebcam && (
          <div className="h-full flex items-center justify-center bg-black">
            <div className="relative w-full h-full max-w-6xl">
              <img
                src={selectedWebcam.live_url}
                alt={selectedWebcam.title}
                className="w-full h-full object-contain"
              />
              
              {/* Immersive overlays */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Environmental data overlay */}
                {environmentData && (
                  <div className="absolute top-4 left-4 bg-black/70 text-white p-3 rounded-lg">
                    <div className="text-xs opacity-75 mb-1">LIVE CONDITIONS</div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>AQI: {environmentData.air_quality.aqi}</div>
                      <div>UV: {environmentData.uv_index}/10</div>
                      <div>Noise: {environmentData.noise_level}dB</div>
                      <div>Visibility: {environmentData.visibility}km</div>
                    </div>
                  </div>
                )}
                
                {/* Crowd indicator */}
                {crowdData && (
                  <div className="absolute bottom-4 left-4 bg-black/70 text-white p-3 rounded-lg">
                    <div className="text-xs opacity-75 mb-1">CROWD ANALYSIS</div>
                    <div className="text-lg font-bold">
                      {crowdData.total_people_estimate.toLocaleString()} people
                    </div>
                    <div className="text-sm opacity-75">
                      Density: {crowdData.crowd_density}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {viewMode === '3d' && (
          <div className="h-full">
            <Canvas camera={{ position: [0, 0, 10] }}>
              <ThreeDVisualization />
            </Canvas>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {!liveData && (
        <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-20">
          <div className="text-center">
            <RefreshCw className="animate-spin mx-auto mb-4 text-blue-500" size={48} />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Connecting to Live Data
            </h3>
            <p className="text-gray-600">
              Establishing real-time connection...
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImmersiveViewport
