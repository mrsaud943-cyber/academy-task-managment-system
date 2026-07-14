import api from './api.js';

const locationCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

// ===== FAST LOCATION GETTERS WITH FALLBACK =====

/**
 * Get current position with timeout and fallback to low accuracy
 */
export const getCurrentPosition = (options = {}) => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported by this browser'));
      return;
    }

    const timeout = options.timeout || 10000;
    let settled = false;
    let highAccuracyFailed = false;

    // Timer for overall timeout
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error('GPS timeout. Try moving to open area or check if GPS is enabled.'));
      }
    }, timeout);

    // Try HIGH accuracy first
    const tryHighAccuracy = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            highAccuracy: true
          });
        },
        (error) => {
          if (settled) return;
          
          // If high accuracy fails, try LOW accuracy
          if (!highAccuracyFailed) {
            highAccuracyFailed = true;
            tryLowAccuracy();
          } else {
            settled = true;
            clearTimeout(timer);
            const errors = {
              1: 'Location permission denied. Please allow location access in browser settings.',
              2: 'GPS signal not found. Please check if location services are enabled on your device.',
              3: 'GPS request timed out. Try again in an open area with clear sky.'
            };
            reject(new Error(errors[error.code] || 'Failed to get location'));
          }
        },
        {
          enableHighAccuracy: true,
          timeout: Math.floor(timeout / 2), // Half time for high accuracy
          maximumAge: 60000 // Allow 1 minute old cached position
        }
      );
    };

    // Fallback: LOW accuracy (faster, uses WiFi/cell towers)
    const tryLowAccuracy = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            highAccuracy: false // Mark as low accuracy
          });
        },
        (error) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          const errors = {
            1: 'Location permission denied. Please allow location access in browser settings.',
            2: 'Location services unavailable. Please enable GPS or WiFi.',
            3: 'Location request timed out. Please check your internet connection.'
          };
          reject(new Error(errors[error.code] || 'Failed to get location'));
        },
        {
          enableHighAccuracy: false, // Use WiFi/cell towers - much faster
          timeout: Math.floor(timeout / 2),
          maximumAge: 120000 // Allow 2 minute old cached position
        }
      );
    };

    // Start with high accuracy
    tryHighAccuracy();
  });
};

/**
 * Quick position check - returns cached if available, else fast low-accuracy
 */
export const getQuickPosition = async () => {
  // First check if we have a recent cached position in memory
  const lastPos = window.__lastKnownPosition;
  if (lastPos && Date.now() - lastPos.time < 30000) { // 30 seconds cache
    return lastPos.data;
  }

  try {
    const pos = await getCurrentPosition({ timeout: 8000 });
    // Cache it
    window.__lastKnownPosition = { data: pos, time: Date.now() };
    return pos;
  } catch (error) {
    // If even low accuracy fails, return a mock/last known or throw
    throw error;
  }
};

/**
 * Watch location changes with smart fallback
 */
export const watchLocation = (onSuccess, onError, options = {}) => {
  if (!navigator.geolocation) {
    onError(new Error('Geolocation not supported'));
    return null;
  }

  let watchId = null;
  let fallbackWatchId = null;

  // Try high accuracy first
  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const data = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };
      window.__lastKnownPosition = { data, time: Date.now() };
      onSuccess(data);
    },
    (error) => {
      // If high accuracy watch fails, start low accuracy watch
      if (!fallbackWatchId) {
        fallbackWatchId = navigator.geolocation.watchPosition(
          (position) => {
            const data = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp
            };
            window.__lastKnownPosition = { data, time: Date.now() };
            onSuccess(data);
          },
          (err) => {
            const errors = {
              1: 'Permission denied',
              2: 'Position unavailable',
              3: 'Timeout'
            };
            onError(new Error(errors[err.code] || 'Watch error'));
          },
          {
            enableHighAccuracy: false,
            timeout: 20000,
            maximumAge: 30000,
            ...options
          }
        );
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
      ...options
    }
  );

  // Return combined cleanup function
  return () => {
    if (watchId) navigator.geolocation.clearWatch(watchId);
    if (fallbackWatchId) navigator.geolocation.clearWatch(fallbackWatchId);
  };
};

// ===== FAST ADDRESS LOOKUP =====

export const getAddressFromCoords = async (latitude, longitude, detailed = false) => {
  const cacheKey = `${latitude.toFixed(5)},${longitude.toFixed(5)}`;
  const cached = locationCache.get(cacheKey);
  
  if (cached && Date.now() - cached.time < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await api.get('/geocode/reverse', {
      params: { lat: latitude, lon: longitude, detailed },
      timeout: 8000
    });

    if (!response.data?.success) {
      throw new Error(response.data?.error || 'Failed to get address');
    }

    const result = {
      locationName: response.data.locationName,
      specificAddress: response.data.data?.specificAddress || response.data.locationName,
      allParts: response.data.data?.allParts || [],
      accuracy: response.data.data?.accuracy || 'general',
      rawData: detailed ? response.data.data : null
    };

    locationCache.set(cacheKey, { data: result, time: Date.now() });
    return result;

  } catch (error) {
    console.error('Address fetch error:', error);
    return {
      locationName: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      specificAddress: null,
      allParts: [],
      accuracy: 'general',
      rawData: null,
      fallback: true
    };
  }
};

// ===== BACKGROUND UPDATE (non-blocking) =====

export const updateAttendanceLocation = async (attendanceId, latitude, longitude, deviceInfo = {}) => {
  const response = await api.put(`/attendance/${attendanceId}/location`, {
    latitude,
    longitude,
    deviceInfo
  }, {
    timeout: 10000
  });
  return response.data;
};

export const updateAttendanceLocationBackground = (attendanceId, latitude, longitude, deviceInfo = {}) => {
  updateAttendanceLocation(attendanceId, latitude, longitude, deviceInfo)
    .then(() => console.log('✅ Location updated'))
    .catch(err => console.error('❌ Background update failed:', err.message));
};

export const getLocationHistory = async (attendanceId, limit = 20) => {
  const response = await api.get(`/attendance/${attendanceId}/location/history`, {
    params: { limit }
  });
  return response.data;
};

export const clearLocationCache = () => locationCache.clear();

export default {
  getCurrentPosition,
  getQuickPosition,
  watchLocation,
  getAddressFromCoords,
  updateAttendanceLocation,
  updateAttendanceLocationBackground,
  getLocationHistory,
  clearLocationCache
};