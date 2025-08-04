// REST Countries API Service - Complete Interface Based on API Response
export interface Country {
  name: {
    common: string;
    official: string;
    nativeName?: {
      [key: string]: {
        official: string;
        common: string;
      };
    };
  };
  tld: string[];
  cca2: string;
  ccn3: string;
  cca3: string;
  cioc?: string;
  independent: boolean;
  status: string;
  unMember: boolean;
  currencies: {
    [key: string]: {
      name: string;
      symbol: string;
    };
  };
  idd: {
    root: string;
    suffixes: string[];
  };
  capital: string[];
  altSpellings: string[];
  region: string;
  subregion: string;
  languages: {
    [key: string]: string;
  };
  latlng: [number, number];
  landlocked: boolean;
  borders?: string[];
  area: number;
  demonyms: {
    eng: {
      f: string;
      m: string;
    };
    fra?: {
      f: string;
      m: string;
    };
  };
  translations: {
    [language: string]: {
      official: string;
      common: string;
    };
  };
  flag: string;
  maps: {
    googleMaps: string;
    openStreetMaps: string;
  };
  population: number;
  gini?: {
    [year: string]: number;
  };
  fifa?: string;
  car: {
    signs: string[];
    side: string;
  };
  timezones: string[];
  continents: string[];
  flags: {
    png: string;
    svg: string;
    alt: string;
  };
  coatOfArms: {
    png: string;
    svg: string;
  };
  startOfWeek: string;
  capitalInfo: {
    latlng: [number, number];
  };
  postalCode?: {
    format: string;
    regex: string;
  };
}

class CountriesApiService {
  private baseUrl = 'https://restcountries.com/v3.1';
  private cache: Map<string, any> = new Map();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  private async fetchWithCache(url: string, cacheKey: string) {
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error(`Error fetching from ${url}:`, error);
      throw error;
    }
  }

  // Get all countries (cached for performance)
  async getAllCountries(): Promise<Country[]> {
    return this.fetchWithCache(`${this.baseUrl}/all`, 'all_countries');
  }

  // Get country by name with exact match from your example
  async getCountryByName(name: string): Promise<Country> {
    const data = await this.fetchWithCache(
      `${this.baseUrl}/name/${encodeURIComponent(name)}`,
      `country_name_${name.toLowerCase()}`
    );
    return data[0]; // Return first match
  }

  // Get countries by region
  async getCountriesByRegion(region: string): Promise<Country[]> {
    return this.fetchWithCache(
      `${this.baseUrl}/region/${encodeURIComponent(region)}`,
      `region_${region.toLowerCase()}`
    );
  }

  // Get countries by subregion
  async getCountriesBySubregion(subregion: string): Promise<Country[]> {
    return this.fetchWithCache(
      `${this.baseUrl}/subregion/${encodeURIComponent(subregion)}`,
      `subregion_${subregion.toLowerCase()}`
    );
  }

  // Get country by alpha code (e.g., 'CA' for Canada)
  async getCountryByCode(code: string): Promise<Country> {
    const data = await this.fetchWithCache(
      `${this.baseUrl}/alpha/${code}`,
      `country_code_${code.toLowerCase()}`
    );
    return Array.isArray(data) ? data[0] : data;
  }

  // Get countries by currency
  async getCountriesByCurrency(currency: string): Promise<Country[]> {
    return this.fetchWithCache(
      `${this.baseUrl}/currency/${currency}`,
      `currency_${currency.toLowerCase()}`
    );
  }

  // Get countries by language
  async getCountriesByLanguage(language: string): Promise<Country[]> {
    return this.fetchWithCache(
      `${this.baseUrl}/lang/${language}`,
      `language_${language.toLowerCase()}`
    );
  }

  // Get countries by capital
  async getCountriesByCapital(capital: string): Promise<Country[]> {
    return this.fetchWithCache(
      `${this.baseUrl}/capital/${encodeURIComponent(capital)}`,
      `capital_${capital.toLowerCase()}`
    );
  }

  // Advanced search with multiple criteria
  async searchCountries(query: string): Promise<Country[]> {
    const searchMethods = [
      () => this.getCountryByName(query),
      () => this.getCountriesByCapital(query),
    ];

    for (const method of searchMethods) {
      try {
        const result = await method();
        return Array.isArray(result) ? result : [result];
      } catch (error) {
        continue; // Try next method
      }
    }

    throw new Error(`No countries found for query: ${query}`);
  }

  // Get popular travel destinations with comprehensive data
  async getPopularDestinations(): Promise<Country[]> {
    const popularCountries = [
      'france', 'italy', 'spain', 'japan', 'thailand', 'australia',
      'brazil', 'canada', 'united kingdom', 'germany', 'netherlands',
      'greece', 'turkey', 'egypt', 'india', 'china', 'south korea',
      'new zealand', 'norway', 'iceland', 'mexico', 'argentina',
      'portugal', 'sweden', 'switzerland', 'austria', 'belgium',
      'czech republic', 'poland', 'croatia', 'united states'
    ];

    try {
      const promises = popularCountries.map(async (country) => {
        try {
          return await this.getCountryByName(country);
        } catch (error) {
          console.warn(`Failed to fetch ${country}:`, error);
          return null;
        }
      });
      
      const results = await Promise.all(promises);
      return results.filter((country): country is Country => country !== null);
    } catch (error) {
      console.error('Error fetching popular destinations:', error);
      throw error;
    }
  }

  // Get regional statistics
  async getRegionalStats(): Promise<{ [region: string]: { count: number; totalPopulation: number } }> {
    const countries = await this.getAllCountries();
    const stats: { [region: string]: { count: number; totalPopulation: number } } = {};

    countries.forEach(country => {
      if (!stats[country.region]) {
        stats[country.region] = { count: 0, totalPopulation: 0 };
      }
      stats[country.region].count++;
      stats[country.region].totalPopulation += country.population;
    });

    return stats;
  }

  // Get comprehensive country data exactly as shown in your curl example
  formatCountryData(country: Country) {
    return {
      // Basic Info
      name: country.name.common,
      officialName: country.name.official,
      nativeName: country.name.nativeName,
      capital: country.capital?.[0] || 'N/A',
      
      // Visual Elements
      flag: country.flags.png,
      flagSvg: country.flags.svg,
      flagEmoji: country.flag,
      flagDescription: country.flags.alt,
      coatOfArms: country.coatOfArms,
      
      // Geographic Data
      population: country.population.toLocaleString(),
      region: country.region,
      subregion: country.subregion,
      coordinates: country.latlng,
      area: country.area?.toLocaleString() + ' km²',
      landlocked: country.landlocked,
      borders: country.borders || [],
      continents: country.continents,
      
      // Cultural Data
      languages: Object.entries(country.languages || {})
        .map(([code, name]) => ({ code, name })),
      languageNames: Object.values(country.languages || {}).join(', '),
      currencies: Object.entries(country.currencies || {})
        .map(([code, curr]) => ({ 
          code, 
          name: curr.name, 
          symbol: curr.symbol 
        })),
      currencyDisplay: Object.entries(country.currencies || {})
        .map(([code, curr]) => `${curr.name} (${curr.symbol})`)
        .join(', '),
      
      // Political Data
      independent: country.independent,
      unMember: country.unMember,
      status: country.status,
      
      // Practical Info
      timezones: country.timezones,
      startOfWeek: country.startOfWeek,
      drivingSide: country.car?.side,
      callingCode: `${country.idd.root}${country.idd.suffixes?.[0] || ''}`,
      topLevelDomain: country.tld,
      
      // Codes
      cca2: country.cca2,
      cca3: country.cca3,
      ccn3: country.ccn3,
      cioc: country.cioc,
      fifa: country.fifa,
      
      // Additional Data
      demonyms: country.demonyms,
      translations: country.translations,
      maps: country.maps,
      gini: country.gini,
      postalCode: country.postalCode,
      capitalCoordinates: country.capitalInfo?.latlng
    };
  }

  // Get country insight for travel planning
  async getCountryInsights(countryName: string) {
    try {
      const country = await this.getCountryByName(countryName);
      const formatted = this.formatCountryData(country);
      
      return {
        ...formatted,
        insights: {
          isDeveloped: country.unMember && !country.landlocked,
          hasCoastline: !country.landlocked,
          majorLanguages: Object.values(country.languages || {}).slice(0, 3),
          timezone: country.timezones?.[0] || 'UTC',
          drivingSide: country.car?.side === 'right' ? 'Right-hand traffic' : 'Left-hand traffic',
          economicIndicator: country.gini ? 'Economic data available' : 'Limited economic data',
          neighboringCountries: country.borders?.length || 0,
          islandNation: country.landlocked === false && (country.borders?.length || 0) === 0
        }
      };
    } catch (error) {
      console.error(`Error getting insights for ${countryName}:`, error);
      throw error;
    }
  }

  // Clear cache (useful for refreshing data)
  clearCache() {
    this.cache.clear();
  }
}

export const countriesApi = new CountriesApiService();
export default countriesApi;
