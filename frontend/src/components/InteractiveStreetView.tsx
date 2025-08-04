import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Navigation,
  MapPin,
  Compass,
  Route,
  Clock,
  Users,
  Camera,
  Volume2,
  Eye,
  Smartphone,
  Car,
  Bike,
  Footprints,
  Bus,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Share2,
  Heart,
  MessageCircle
} from 'lucide-react'

interface InteractiveStreetViewProps {
  location: {
    latitude: number
    longitude: number
    name: string
  }
  onLocationChange?: (newLocation: any) => void
}

interface NavigationMode {
  type: 'walking' | 'cycling' | 'driving' | 'transit'
  speed: number
  description: string
  icon: React.ComponentType<any>
}

interface StreetViewMarker {
  id: string
  position: google.maps.LatLng
  type: 'poi' | 'person' | 'event' | 'shop'
  title: string
  description: string
  icon: string
  interactive: boolean
}

const InteractiveStreetView: React.FC<InteractiveStreetViewProps> = ({ 
  location, 
  onLocationChange 
}) => {
  const [streetView, setStreetView] = useState<google.maps.StreetViewPanorama | null>(null)
  const [currentPosition, setCurrentPosition] = useState<google.maps.LatLng | null>(null)
  const [navigationMode, setNavigationMode] = useState<NavigationMode>({
    type: 'walking',
    speed: 1.4,
    description: 'Walking pace',
    icon: Footprints
  })
  const [isNavigating, setIsNavigating] = useState(false)
  const [markers, setMarkers] = useState<StreetViewMarker[]>([])
  const [heading, setHeading] = useState(0)
  const [pitch, setPitch] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [isImmersiveMode, setIsImmersiveMode] = useState(false)
  const [showUI, setShowUI] = useState(true)
  const [nearbyPeople, setNearbyPeople] = useState<any[]>([])
  const [liveEvents, setLiveEvents] = useState<any[]>([])
  
  const streetViewRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()

  const navigationModes: NavigationMode[] = [
    { type: 'walking', speed: 1.4, description: 'Walking pace', icon: Footprints },
    { type: 'cycling', speed: 15, description: 'Cycling speed', icon: Bike },
    { type: 'driving', speed: 50, description: 'Driving speed', icon: Car },
    { type: 'transit', speed: 25, description: 'Public transport', icon: Bus }
  ]

  // Initialize Google Street View
  useEffect(() => {
    if (!streetViewRef.current || !window.google) return

    const sv = new google.maps.StreetViewService()
    const panorama = new google.maps.StreetViewPanorama(streetViewRef.current, {
      position: { lat: location.latitude, lng: location.longitude },
      pov: { heading: 0, pitch: 0 },
      zoom: 1,
      addressControl: false,
      panControl: false,
      zoomControl: false,
      enableCloseButton: false,
      showRoadLabels: true,
      motionTracking: true,
      motionTrackingControl: true
    })

    // Enhanced panorama with live overlays
    panorama.addListener('position_changed', () => {
      const newPos = panorama.getPosition()
      if (newPos) {
        setCurrentPosition(newPos)
        loadNearbyData(newPos.lat(), newPos.lng())
        onLocationChange?.({
          latitude: newPos.lat(),
          longitude: newPos.lng(),
          name: `${newPos.lat().toFixed(6)}, ${newPos.lng().toFixed(6)}`
        })
      }
    })

    panorama.addListener('pov_changed', () => {
      const pov = panorama.getPov()
      setHeading(pov.heading || 0)
      setPitch(pov.pitch || 0)
    })

    panorama.addListener('zoom_changed', () => {
      setZoom(panorama.getZoom() || 1)
    })

    setStreetView(panorama)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [location])

  // Load nearby live data
  const loadNearbyData = async (lat: number, lng: number) => {
    try {
      // Fetch live people data
      const peopleResponse = await fetch(`/api/live/people-counter/${lat},${lng}`)
      if (peopleResponse.ok) {
        const peopleData = await peopleResponse.json()
        setNearbyPeople(generateNearbyPeople(lat, lng, peopleData.total_people_estimate))
      }

      // Fetch live events
      const eventsResponse = await fetch(`/api/live/events/${lat}/${lng}`)
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        setLiveEvents(eventsData)
      }

      // Generate interactive markers
      generateInteractiveMarkers(lat, lng)
    } catch (error) {
      console.error('Error loading nearby data:', error)
    }
  }

  // Generate realistic nearby people based on live data
  const generateNearbyPeople = (lat: number, lng: number, totalCount: number) => {
    const people = []
    const visibleCount = Math.min(totalCount / 10, 20) // Show subset of total people
    
    for (let i = 0; i < visibleCount; i++) {
      people.push({
        id: `person_${i}`,
        position: {
          lat: lat + (Math.random() - 0.5) * 0.001,
          lng: lng + (Math.random() - 0.5) * 0.001
        },
        activity: ['walking', 'standing', 'sitting', 'photography', 'shopping'][Math.floor(Math.random() * 5)],
        demographic: ['tourist', 'local', 'business', 'student'][Math.floor(Math.random() * 4)],
        direction: Math.random() * 360,
        speed: Math.random() * 2 + 0.5,
        lastUpdate: Date.now()
      })
    }
    
    return people
  }

  // Generate interactive markers for POIs
  const generateInteractiveMarkers = (lat: number, lng: number) => {
    const newMarkers: StreetViewMarker[] = [
      {
        id: 'restaurant_1',
        position: new google.maps.LatLng(lat + 0.0005, lng + 0.0003),
        type: 'shop',
        title: 'Local Restaurant',
        description: 'Traditional cuisine - Currently: 15 people dining',
        icon: '🍽️',
        interactive: true
      },
      {
        id: 'landmark_1',
        position: new google.maps.LatLng(lat - 0.0003, lng + 0.0002),
        type: 'poi',
        title: 'Historic Monument',
        description: 'Built in 1850 - 8 visitors present',
        icon: '🏛️',
        interactive: true
      },
      {
        id: 'event_1',
        position: new google.maps.LatLng(lat + 0.0002, lng - 0.0004),
        type: 'event',
        title: 'Street Performance',
        description: 'Live music - 25 people watching',
        icon: '🎭',
        interactive: true
      }
    ]
    
    setMarkers(newMarkers)
  }

  // Smooth navigation between points
  const navigateToPosition = (targetLat: number, targetLng: number) => {
    if (!streetView || !currentPosition) return

    setIsNavigating(true)
    const startLat = currentPosition.lat()
    const startLng = currentPosition.lng()
    const duration = 3000 // 3 seconds
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Smooth easing function
      const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
      const easedProgress = easeInOut(progress)
      
      const currentLat = startLat + (targetLat - startLat) * easedProgress
      const currentLng = startLng + (targetLng - startLng) * easedProgress
      
      streetView.setPosition({ lat: currentLat, lng: currentLng })
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setIsNavigating(false)
      }
    }
    
    animate()
  }

  // Auto-navigate mode
  const startAutoNavigation = () => {
    if (!currentPosition) return
    
    const destination = {
      lat: currentPosition.lat() + (Math.random() - 0.5) * 0.01,
      lng: currentPosition.lng() + (Math.random() - 0.5) * 0.01
    }
    
    navigateToPosition(destination.lat, destination.lng)
  }

  // Control functions
  const rotatePanorama = (direction: 'left' | 'right') => {
    if (!streetView) return
    const pov = streetView.getPov()
    const newHeading = pov.heading + (direction === 'left' ? -45 : 45)
    streetView.setPov({ ...pov, heading: newHeading })
  }

  const adjustPitch = (direction: 'up' | 'down') => {
    if (!streetView) return
    const pov = streetView.getPov()
    const newPitch = Math.max(-90, Math.min(90, pov.pitch + (direction === 'up' ? 10 : -10)))
    streetView.setPov({ ...pov, pitch: newPitch })
  }

  const adjustZoom = (direction: 'in' | 'out') => {
    if (!streetView) return
    const currentZoom = streetView.getZoom()
    const newZoom = direction === 'in' ? currentZoom + 0.5 : currentZoom - 0.5
    streetView.setZoom(Math.max(0, Math.min(3, newZoom)))
  }

  const LiveOverlay: React.FC<{ person: any }> = ({ person }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      className="absolute transform -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${50 + (person.position.lng - (currentPosition?.lng() || 0)) * 100000}%`,
        top: `${50 + (person.position.lat - (currentPosition?.lat() || 0)) * 100000}%`,
      }}
    >
      <div className="relative">
        {/* Person indicator */}
        <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
        
        {/* Hover info */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 hover:opacity-100 transition-opacity">
          <div className="bg-black/80 text-white text-xs p-2 rounded whitespace-nowrap">
            <div className="font-medium">{person.demographic}</div>
            <div className="text-gray-300">{person.activity}</div>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const MarkerOverlay: React.FC<{ marker: StreetViewMarker }> = ({ marker }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.1 }}
      className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer"
      style={{
        left: `${50 + (marker.position.lng() - (currentPosition?.lng() || 0)) * 100000}%`,
        top: `${50 + (marker.position.lat() - (currentPosition?.lat() || 0)) * 100000}%`,
      }}
      onClick={() => navigateToPosition(marker.position.lat(), marker.position.lng())}
    >
      <div className="relative">
        {/* Marker icon */}
        <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-lg border-2 border-blue-500">
          {marker.icon}
        </div>
        
        {/* Info popup */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2">
          <div className="bg-white rounded-lg shadow-xl p-3 min-w-48 border">
            <h4 className="font-semibold text-gray-800 text-sm">{marker.title}</h4>
            <p className="text-gray-600 text-xs mt-1">{marker.description}</p>
            <button className="mt-2 text-blue-500 text-xs font-medium hover:text-blue-600">
              Visit Location →
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Street View Container */}
      <div ref={streetViewRef} className="w-full h-full" />
      
      {/* Live Overlays */}
      <div className="absolute inset-0 pointer-events-none">
        {/* People Indicators */}
        <AnimatePresence>
          {nearbyPeople.map(person => (
            <LiveOverlay key={person.id} person={person} />
          ))}
        </AnimatePresence>
        
        {/* Interactive Markers */}
        <div className="pointer-events-auto">
          <AnimatePresence>
            {markers.map(marker => (
              <MarkerOverlay key={marker.id} marker={marker} />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Control Interface */}
      <AnimatePresence>
        {showUI && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Navigation Mode Selector */}
            <div className="absolute top-4 left-4 pointer-events-auto">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                <div className="flex items-center gap-2">
                  {navigationModes.map((mode) => {
                    const Icon = mode.icon
                    return (
                      <button
                        key={mode.type}
                        onClick={() => setNavigationMode(mode)}
                        className={`p-2 rounded transition-colors ${
                          navigationMode.type === mode.type
                            ? 'bg-blue-500 text-white'
                            : 'hover:bg-gray-100'
                        }`}
                        title={mode.description}
                      >
                        <Icon size={20} />
                      </button>
                    )
                  })}
                </div>
                <div className="text-xs text-gray-600 mt-1 text-center">
                  {navigationMode.description}
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                <div className="grid grid-cols-3 gap-2">
                  {/* Rotation Controls */}
                  <button
                    onClick={() => rotatePanorama('left')}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Look Left"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <button
                    onClick={startAutoNavigation}
                    disabled={isNavigating}
                    className={`p-2 rounded transition-colors ${
                      isNavigating
                        ? 'bg-blue-100 text-blue-500 cursor-not-allowed'
                        : 'hover:bg-gray-100'
                    }`}
                    title="Auto Navigate"
                  >
                    <Navigation size={20} />
                  </button>
                  
                  <button
                    onClick={() => rotatePanorama('right')}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Look Right"
                  >
                    <ChevronRight size={20} />
                  </button>

                  {/* Zoom Controls */}
                  <button
                    onClick={() => adjustZoom('out')}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut size={20} />
                  </button>
                  
                  <button
                    onClick={() => streetView?.setPov({ heading: 0, pitch: 0 })}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Reset View"
                  >
                    <RotateCcw size={20} />
                  </button>
                  
                  <button
                    onClick={() => adjustZoom('in')}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Information Panel */}
            <div className="absolute top-4 right-4 pointer-events-auto">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-sm">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="text-blue-500" size={20} />
                  <span className="font-semibold text-gray-800">{location.name}</span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Nearby People:</span>
                    <span className="font-medium">{nearbyPeople.length} visible</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">View Direction:</span>
                    <span className="font-medium">{Math.round(heading)}°</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Zoom Level:</span>
                    <span className="font-medium">{zoom.toFixed(1)}x</span>
                  </div>
                </div>

                {liveEvents.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-sm font-medium text-gray-800 mb-2">Live Events Nearby:</div>
                    <div className="space-y-1">
                      {liveEvents.slice(0, 2).map((event, index) => (
                        <div key={index} className="text-xs text-gray-600">
                          • {event.description}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Social Actions */}
            <div className="absolute bottom-4 right-4 pointer-events-auto">
              <div className="flex flex-col gap-2">
                <button className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors">
                  <Heart size={20} className="text-red-500" />
                </button>
                <button className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors">
                  <Share2 size={20} className="text-blue-500" />
                </button>
                <button className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors">
                  <MessageCircle size={20} className="text-green-500" />
                </button>
              </div>
            </div>

            {/* UI Toggle */}
            <button
              onClick={() => setShowUI(!showUI)}
              className="absolute top-1/2 left-2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors pointer-events-auto"
            >
              <Eye size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {isNavigating && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="font-medium text-gray-800">Navigating...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InteractiveStreetView
