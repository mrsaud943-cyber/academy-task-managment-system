import axios from 'axios';

const LOCATIONIQ_API_KEY = process.env.LOCATIONIQ_API_KEY;

// Plain JS Map cache (no package needed)
const geocodeCache = new Map();
const CACHE_TTL_MS = 3600 * 1000; // 1 hour

// Helper to clean expired entries
const cleanExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of geocodeCache.entries()) {
    if (now - value.timestamp > CACHE_TTL_MS) {
      geocodeCache.delete(key);
    }
  }
};

/**
 * Build most specific address from LocationIQ response
 */
const buildSpecificAddress = (address, displayName) => {
  const parts = [];
  
  const priority = [
    address.building,
    address.house_number,
    address.road || address.street,
    address.neighbourhood || address.suburb,
    address.landmark || address.city_district,
    address.village,
    address.town,
    address.city,
    address.state_district || address.county,
    address.state,
    address.country,
    address.postcode
  ];

  for (const part of priority) {
    if (part && !parts.includes(part)) parts.push(part);
  }

  const specific = parts.slice(0, 4).join(', ');
  return specific || displayName || null;
};

/**
 * Get accuracy level based on available data
 */
const getAccuracyLevel = (address) => {
  if (address.building || address.house_number) return 'exact';
  if (address.road || address.street) return 'street';
  if (address.neighbourhood || address.suburb) return 'neighborhood';
  if (address.village || address.town) return 'village';
  if (address.city) return 'city';
  return 'general';
};

/**
 * Reverse Geocode - Optimized with plain JS Map caching
 */
export const reverseGeocodeController = async (req, res) => {
  try {
    const { lat, lon, detailed = 'false' } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required',
        locationName: `${lat || '?'}, ${lon || '?'}`
      });
    }

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    if (isNaN(latNum) || isNaN(lonNum)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates',
        locationName: `${lat}, ${lon}`
      });
    }

    // Clean expired entries periodically
    if (geocodeCache.size > 1000) cleanExpiredCache();

    const cacheKey = `${latNum.toFixed(6)},${lonNum.toFixed(6)}`;
    const cached = geocodeCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS) && detailed !== 'true') {
      return res.json({ success: true, ...cached.data, cached: true });
    }

    if (!LOCATIONIQ_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'LocationIQ API key not configured',
        locationName: `${latNum.toFixed(6)}, ${lonNum.toFixed(6)}`
      });
    }

    const url = 'https://us1.locationiq.com/v1/reverse';
    const response = await axios.get(url, {
      params: {
        key: LOCATIONIQ_API_KEY,
        lat: latNum,
        lon: lonNum,
        format: 'json',
        normalizeaddress: 1,
        'accept-language': 'en',
        addressdetails: 1,
        zoom: 18,
        namedetails: 1,
        extratags: 1
      },
      timeout: 10000
    });

    const { address, display_name } = response.data || {};

    if (!address) {
      return res.json({
        success: false,
        locationName: `${latNum.toFixed(6)}, ${lonNum.toFixed(6)}`,
        error: 'No address found'
      });
    }

    const specificAddress = buildSpecificAddress(address, display_name);
    const accuracy = getAccuracyLevel(address);

    const result = {
      locationName: specificAddress || display_name || `${latNum.toFixed(6)}, ${lonNum.toFixed(6)}`,
      data: detailed === 'true' ? {
        building: address.building || address.house_number || null,
        houseNumber: address.house_number || null,
        street: address.road || address.street || null,
        neighborhood: address.neighbourhood || address.suburb || null,
        landmark: address.landmark || address.city_district || null,
        village: address.village || null,
        town: address.town || null,
        city: address.city || null,
        district: address.state_district || address.county || null,
        state: address.state || null,
        country: address.country || null,
        postalCode: address.postcode || null,
        formatted: display_name,
        specificAddress,
        accuracy
      } : null
    };

    // Store in cache
    geocodeCache.set(cacheKey, { data: result, timestamp: Date.now() });

    return res.json({
      success: true,
      ...result,
      cached: false
    });

  } catch (error) {
    console.error('❌ Geocode Error:', error.message);
    
    let statusCode = 500;
    let errorMessage = 'Failed to fetch location';

    if (error.response) {
      statusCode = error.response.status;
      const statusMessages = {
        401: 'Invalid API key',
        429: 'Rate limit exceeded',
        403: 'Access forbidden'
      };
      errorMessage = statusMessages[statusCode] || errorMessage;
    }

    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
      locationName: `${req.query.lat || '?'}, ${req.query.lon || '?'}`
    });
  }
};

/**
 * Batch Reverse Geocode - Optimized with Promise.allSettled
 */
export const batchReverseGeocodeController = async (req, res) => {
  try {
    const { coordinates } = req.body;

    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Coordinates array is required'
      });
    }

    if (coordinates.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 50 coordinates per batch'
      });
    }

    if (!LOCATIONIQ_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'LocationIQ API key not configured'
      });
    }

    const concurrencyLimit = 5;
    const results = [];
    
    for (let i = 0; i < coordinates.length; i += concurrencyLimit) {
      const batch = coordinates.slice(i, i + concurrencyLimit);
      
      const batchResults = await Promise.allSettled(
        batch.map(async (coord) => {
          const lat = coord.lat || coord.latitude;
          const lon = coord.lon || coord.longitude;
          
          if (!lat || !lon) {
            return { ...coord, locationName: 'Invalid coordinates', error: 'Missing lat/lon' };
          }

          const cacheKey = `${parseFloat(lat).toFixed(6)},${parseFloat(lon).toFixed(6)}`;
          const cached = geocodeCache.get(cacheKey);
          if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
            return { ...coord, ...cached.data, cached: true };
          }

          try {
            const response = await axios.get(
              `https://us1.locationiq.com/v1/reverse?key=${LOCATIONIQ_API_KEY}&lat=${lat}&lon=${lon}&format=json&addressdetails=1&zoom=18&normalizeaddress=1`,
              { timeout: 8000 }
            );
            
            const address = response.data.address || {};
            const specificAddress = buildSpecificAddress(address, response.data.display_name);
            
            const result = {
              locationName: specificAddress || response.data.display_name || `${lat}, ${lon}`,
              data: {
                building: address.building || null,
                street: address.road || address.street || null,
                neighborhood: address.neighbourhood || address.suburb || null,
                city: address.city || null,
                state: address.state || null,
                country: address.country || null
              }
            };

            geocodeCache.set(cacheKey, { data: result, timestamp: Date.now() });
            return { ...coord, ...result, cached: false };
          } catch (error) {
            return { 
              ...coord, 
              locationName: `${lat}, ${lon}`, 
              error: error.message 
            };
          }
        })
      );

      results.push(...batchResults.map(r => r.status === 'fulfilled' ? r.value : { 
        ...r.reason, 
        error: 'Request failed' 
      }));

      if (i + concurrencyLimit < coordinates.length) {
        await new Promise(r => setTimeout(r, 100));
      }
    }

    return res.json({
      success: true,
      data: results,
      total: results.length,
      failed: results.filter(r => r.error).length
    });

  } catch (error) {
    console.error('Batch geocode error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch locations'
    });
  }
};

/**
 * Search Geocode (Forward)
 */
export const searchGeocodeController = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query?.trim() || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters'
      });
    }

    if (!LOCATIONIQ_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'LocationIQ API key not configured'
      });
    }

    const response = await axios.get('https://us1.locationiq.com/v1/search', {
      params: {
        key: LOCATIONIQ_API_KEY,
        q: query.trim(),
        format: 'json',
        limit: 5,
        'accept-language': 'en'
      },
      timeout: 8000
    });

    const results = (response.data || []).map(item => ({
      lat: item.lat,
      lon: item.lon,
      displayName: item.display_name,
      type: item.type,
      class: item.class,
      importance: item.importance
    }));

    return res.json({
      success: true,
      data: results,
      count: results.length
    });

  } catch (error) {
    console.error('Search geocode error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to search location'
    });
  }
};

/**
 * Health Check
 */
export const geocodeHealthCheck = async (req, res) => {
  try {
    const apiKeyConfigured = !!LOCATIONIQ_API_KEY;
    let apiKeyValid = false;

    if (apiKeyConfigured) {
      try {
        const testResponse = await axios.get(
          `https://us1.locationiq.com/v1/reverse?key=${LOCATIONIQ_API_KEY}&lat=33.0157&lon=70.5988&format=json&zoom=10`,
          { timeout: 5000 }
        );
        apiKeyValid = testResponse.status === 200;
      } catch {
        apiKeyValid = false;
      }
    }

    return res.json({
      success: true,
      status: 'OK',
      apiKeyConfigured,
      apiKeyValid,
      cacheSize: geocodeCache.size,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};