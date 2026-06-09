import { SoilResponse } from '../types/soil';
import { ENV } from '../config/env';

export const fetchSoilData = async (lat: number, lon: number): Promise<SoilResponse> => {
  try {
    const response = await fetch(`${ENV.soilApiBaseUrl}?lat=${lat}&lon=${lon}`, {
      method: 'GET',
      headers: {
        accept: '*/*',
      },
    });
    if (!response.ok) {
      throw new Error(`Error fetching soil data: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Soil service error:', error);
    throw error;
  }
};
