import { z } from 'zod';

// Zod schema for validating geocoding response
const geocodingResponseSchema = z.object({
  address: z.object({
    city: z.string().optional(),
    town: z.string().optional(),
    village: z.string().optional(),
    county: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  display_name: z.string().optional(),
});

export interface GeolocationResult {
  location: string;
  success: boolean;
  error?: string;
}

// Sanitize location string to prevent XSS
const sanitizeLocationString = (str: string): string => {
  return str
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .substring(0, 500); // Limit length
};

export const fetchLocationFromCoordinates = async (
  latitude: number,
  longitude: number
): Promise<GeolocationResult> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      { 
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();
    
    // Validate response structure
    const validationResult = geocodingResponseSchema.safeParse(data);
    
    if (!validationResult.success) {
      console.warn('Invalid geocoding response structure');
      // Fallback to coordinates
      return {
        location: sanitizeLocationString(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`),
        success: true,
      };
    }

    const validData = validationResult.data;
    
    // Extract location with fallbacks
    const locationParts = [
      validData.address?.city,
      validData.address?.town,
      validData.address?.village,
      validData.address?.county,
      validData.address?.state,
      validData.address?.country,
    ].filter(Boolean);

    const location = locationParts.length > 0
      ? sanitizeLocationString(locationParts.slice(0, 3).join(', '))
      : validData.display_name
        ? sanitizeLocationString(validData.display_name)
        : sanitizeLocationString(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);

    return {
      location,
      success: true,
    };
  } catch (error: any) {
    clearTimeout(timeout);
    
    if (error.name === 'AbortError') {
      console.warn('Geocoding request timed out');
      return {
        location: sanitizeLocationString(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`),
        success: true,
        error: 'Request timed out, using coordinates',
      };
    }

    console.error('Geocoding error:', error);
    // Fallback to coordinates on any error
    return {
      location: sanitizeLocationString(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`),
      success: true,
      error: error.message,
    };
  }
};

export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    });
  });
};
