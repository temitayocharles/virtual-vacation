import { Router, Request, Response } from 'express'
import axios from 'axios'
import { cache } from '../config/redis'
import { logger } from '../utils/logger'

const router = Router()

// Get all countries
router.get('/', async (req: Request, res: Response) => {
  try {
    const cacheKey = 'countries:all'
    const cachedCountries = await cache.get(cacheKey)

    if (cachedCountries) {
      return res.json(JSON.parse(cachedCountries))
    }

    // Fetch from REST Countries API
    const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,cca2,cca3,capital,region,subregion,population,area,flag,flags,coatOfArms,languages,currencies,timezones,latlng')
    
    const countries = response.data.map((country: any) => ({
      code: country.cca2,
      name: country.name.common,
      officialName: country.name.official,
      capital: country.capital?.[0],
      region: country.region,
      subregion: country.subregion,
      population: country.population,
      area: country.area,
      flag: country.flag,
      flagUrl: country.flags.png,
      coatOfArms: country.coatOfArms?.png,
      languages: country.languages,
      currencies: country.currencies,
      timezones: country.timezones,
      coordinates: country.latlng
    }))

    // Cache for 1 day
    await cache.set(cacheKey, JSON.stringify(countries), 86400)

    res.json(countries)
  } catch (error) {
    logger.error('Error fetching countries:', error)
    res.status(500).json({
      error: 'Failed to fetch countries'
    })
  }
})

// Get country by code
router.get('/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params
    const cacheKey = `country:${code}`
    const cachedCountry = await cache.get(cacheKey)

    if (cachedCountry) {
      return res.json(JSON.parse(cachedCountry))
    }

    const response = await axios.get(`https://restcountries.com/v3.1/alpha/${code}`)
    
    if (response.data.length === 0) {
      return res.status(404).json({
        error: 'Country not found'
      })
    }

    const country = response.data[0]
    const countryData = {
      code: country.cca2,
      name: country.name.common,
      officialName: country.name.official,
      capital: country.capital?.[0],
      region: country.region,
      subregion: country.subregion,
      population: country.population,
      area: country.area,
      flag: country.flag,
      flagUrl: country.flags.png,
      coatOfArms: country.coatOfArms?.png,
      languages: country.languages,
      currencies: country.currencies,
      timezones: country.timezones,
      coordinates: country.latlng,
      borders: country.borders,
      nativeName: country.name.nativeName
    }

    // Cache for 1 day
    await cache.set(cacheKey, JSON.stringify(countryData), 86400)

    res.json(countryData)
  } catch (error) {
    logger.error('Error fetching country:', error)
    res.status(500).json({
      error: 'Failed to fetch country'
    })
  }
})

export default router
