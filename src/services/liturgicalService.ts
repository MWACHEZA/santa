/**
 * Service to interact with the Catholic Readings API
 * Documentation: https://cpbjr.github.io/catholic-readings-api/
 */

export interface CatholicReadings {
  date: string;
  monthDay: string;
  season: string;
  subSeason?: string;
  readings: {
    firstReading: string;
    psalm: string;
    secondReading?: string;
    gospel: string;
  };
  usccbLink: string;
  apiEndpoint: string;
}

export interface CatholicCelebration {
  date: string;
  monthDay: string;
  season: string;
  celebration: {
    name: string;
    type: string;
    quote?: string;
    description?: string;
    image?: string;
  };
  liturgicalNote?: string;
  historicalNote?: string;
  apiEndpoint: string;
}

const BASE_URL = 'https://cpbjr.github.io/catholic-readings-api';

export const liturgicalService = {
  /**
   * Get daily readings for a specific date (defaults to today)
   */
  getReadings: async (date: Date = new Date()): Promise<CatholicReadings | null> => {
    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      const response = await fetch(`${BASE_URL}/readings/${year}/${month}-${day}.json`);
      if (!response.ok) throw new Error('Failed to fetch readings');
      return await response.json();
    } catch (error) {
      console.error('Error fetching daily readings:', error);
      return null;
    }
  },

  /**
   * Get liturgical calendar/celebration for a specific date (defaults to today)
   */
  getCelebration: async (date: Date = new Date()): Promise<CatholicCelebration | null> => {
    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      const response = await fetch(`${BASE_URL}/liturgical-calendar/${year}/${month}-${day}.json`);
      if (!response.ok) throw new Error('Failed to fetch celebration');
      return await response.json();
    } catch (error) {
      console.error('Error fetching celebration:', error);
      return null;
    }
  }
};

export default liturgicalService;
