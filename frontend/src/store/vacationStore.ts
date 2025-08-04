import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface Location {
  id: string
  name: string
  country: string
  countryCode: string
  latitude: number
  longitude: number
  type: 'city' | 'landmark' | 'nature'
  description?: string
  imageUrl?: string
  streetViewAvailable: boolean
}

export interface Weather {
  temperature: number
  description: string
  humidity: number
  windSpeed: number
  icon: string
}

export interface TransportMode {
  type: 'walking' | 'cycling' | 'driving' | 'transit'
  speed: number
  description: string
}

export interface AudioSettings {
  volume: number
  ambientSounds: boolean
  radioEnabled: boolean
  currentRadioStation?: string
  soundEffects: boolean
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: string
  units: 'metric' | 'imperial'
  autoPlay: boolean
  highQuality: boolean
}

interface VacationState {
  // Current state
  currentLocation: Location | null
  weather: Weather | null
  transportMode: TransportMode
  audioSettings: AudioSettings
  userPreferences: UserPreferences
  isLoading: boolean
  error: string | null

  // Data
  countries: any[]
  cities: Location[]
  favorites: Location[]
  recentlyVisited: Location[]

  // Actions
  setCurrentLocation: (location: Location) => void
  setWeather: (weather: Weather) => void
  setTransportMode: (mode: TransportMode) => void
  updateAudioSettings: (settings: Partial<AudioSettings>) => void
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addToFavorites: (location: Location) => void
  removeFromFavorites: (locationId: string) => void
  addToRecentlyVisited: (location: Location) => void
  setCountries: (countries: any[]) => void
  setCities: (cities: Location[]) => void
}

export const useVacationStore = create<VacationState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentLocation: null,
        weather: null,
        transportMode: {
          type: 'walking',
          speed: 5,
          description: 'Walking pace exploration'
        },
        audioSettings: {
          volume: 0.7,
          ambientSounds: true,
          radioEnabled: true,
          soundEffects: true
        },
        userPreferences: {
          theme: 'auto',
          language: 'en',
          units: 'metric',
          autoPlay: true,
          highQuality: true
        },
        isLoading: false,
        error: null,
        countries: [],
        cities: [],
        favorites: [],
        recentlyVisited: [],

        // Actions
        setCurrentLocation: (location) => {
          set({ currentLocation: location })
          get().addToRecentlyVisited(location)
        },

        setWeather: (weather) => set({ weather }),

        setTransportMode: (mode) => set({ transportMode: mode }),

        updateAudioSettings: (settings) =>
          set((state) => ({
            audioSettings: { ...state.audioSettings, ...settings }
          })),

        updateUserPreferences: (preferences) =>
          set((state) => ({
            userPreferences: { ...state.userPreferences, ...preferences }
          })),

        setLoading: (loading) => set({ isLoading: loading }),

        setError: (error) => set({ error }),

        addToFavorites: (location) =>
          set((state) => ({
            favorites: state.favorites.find(fav => fav.id === location.id)
              ? state.favorites
              : [...state.favorites, location]
          })),

        removeFromFavorites: (locationId) =>
          set((state) => ({
            favorites: state.favorites.filter(fav => fav.id !== locationId)
          })),

        addToRecentlyVisited: (location) =>
          set((state) => {
            const recent = state.recentlyVisited.filter(item => item.id !== location.id)
            return {
              recentlyVisited: [location, ...recent].slice(0, 10) // Keep last 10
            }
          }),

        setCountries: (countries) => set({ countries }),

        setCities: (cities) => set({ cities })
      }),
      {
        name: 'virtual-vacation-store',
        partialize: (state) => ({
          favorites: state.favorites,
          recentlyVisited: state.recentlyVisited,
          audioSettings: state.audioSettings,
          userPreferences: state.userPreferences
        })
      }
    ),
    {
      name: 'virtual-vacation-store'
    }
  )
)
