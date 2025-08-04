import api from './api'
import { Location, Weather } from '../store/vacationStore'

export interface Country {
  name: {
    common: string
    official: string
  }
  cca2: string
  cca3: string
  capital: string[]
  region: string
  subregion: string
  population: number
  area: number
  flag: string
  flags: {
    png: string
    svg: string
  }
  coatOfArms: {
    png: string
    svg: string
  }
  languages: Record<string, string>
  currencies: Record<string, any>
  timezones: string[]
  latlng: [number, number]
}

export interface City {
  id: string
  name: string
  country: string
  countryCode: string
  latitude: number
  longitude: number
  population: number
  timezone: string
  elevation: number
}

// Countries API
export const countriesApi = {
  getAll: async (): Promise<Country[]> => {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,cca3,capital,region,subregion,population,area,flag,flags,coatOfArms,languages,currencies,timezones,latlng')
    return response.json()
  },

  getByCode: async (code: string): Promise<Country> => {
    const response = await fetch(`https://restcountries.com/v3.1/alpha/${code}`)
    const countries = await response.json()
    return countries[0]
  },

  getByRegion: async (region: string): Promise<Country[]> => {
    const response = await fetch(`https://restcountries.com/v3.1/region/${region}`)
    return response.json()
  }
}

// Cities API
export const citiesApi = {
  getByCountry: async (countryCode: string): Promise<Location[]> => {
    const response = await api.get(`/cities/country/${countryCode}`)
    return response.data
  },

  getPopular: async (): Promise<Location[]> => {
    const response = await api.get('/cities/popular')
    return response.data
  },

  search: async (query: string): Promise<Location[]> => {
    const response = await api.get(`/cities/search?q=${encodeURIComponent(query)}`)
    return response.data
  },

  getById: async (id: string): Promise<Location> => {
    const response = await api.get(`/cities/${id}`)
    return response.data
  }
}

// Weather API
export const weatherApi = {
  getCurrent: async (lat: number, lon: number): Promise<Weather> => {
    const response = await api.get(`/weather/current?lat=${lat}&lon=${lon}`)
    return response.data
  },

  getForecast: async (lat: number, lon: number): Promise<any> => {
    const response = await api.get(`/weather/forecast?lat=${lat}&lon=${lon}`)
    return response.data
  }
}

// Street View API
export const streetViewApi = {
  checkAvailability: async (lat: number, lon: number): Promise<boolean> => {
    const response = await api.get(`/streetview/check?lat=${lat}&lon=${lon}`)
    return response.data.available
  },

  getMetadata: async (lat: number, lon: number): Promise<any> => {
    const response = await api.get(`/streetview/metadata?lat=${lat}&lon=${lon}`)
    return response.data
  }
}

// Radio API
export const radioApi = {
  getStationsByCountry: async (countryCode: string): Promise<any[]> => {
    const response = await api.get(`/radio/country/${countryCode}`)
    return response.data
  },

  getStationsByLocation: async (lat: number, lon: number): Promise<any[]> => {
    const response = await api.get(`/radio/location?lat=${lat}&lon=${lon}`)
    return response.data
  }
}

// Sounds API
export const soundsApi = {
  getAmbientSounds: async (type: string): Promise<any[]> => {
    const response = await api.get(`/sounds/ambient/${type}`)
    return response.data
  },

  getCitySounds: async (cityId: string): Promise<any[]> => {
    const response = await api.get(`/sounds/city/${cityId}`)
    return response.data
  }
}
