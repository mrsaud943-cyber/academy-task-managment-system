import Attendance from '../models/Attendance.js';
import axios from 'axios';

const LOCATIONIQ_API_KEY = process.env.LOCATIONIQ_API_KEY;
const locationCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Get cached or fetch new address - FAST
 */
const getAddressFromCoords = async (latitude, longitude) => {
  const cacheKey = `${latitude.toFixed(5)},${longitude.toFixed(5)}`;
  const cached = locationCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  if (!LOCATIONIQ_API_KEY) {
    return {
      address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      details: null,
      accuracy: 'general'
    };
  }

  try {
    // 🔥 Fast timeout - don't hang the request
    const response = await axios.get('https://us1.locationiq.com/v1/reverse', {
      params: {
        key: LOCATIONIQ_API_KEY,
        lat: latitude,
        lon: longitude,
        format: 'json',
        normalizeaddress: 1,
        'accept-language': 'en',
        addressdetails: 1,
        zoom: 18
      },
      timeout: 5000 // 5s max - don't hang user
    });

    if (!response.data?.address) {
      throw new Error('No address data');
    }

    const address = response.data.address;
    
    // Build specific address parts
    const parts = [];
    if (address.building) parts.push(address.building);
    if (address.house_number) parts.push(address.house_number);
    if (address.road || address.street) parts.push(address.road || address.street);
    if (address.neighbourhood || address.suburb) parts.push(address.neighbourhood || address.suburb);
    if (address.village) parts.push(address.village);
    if (address.town) parts.push(address.town);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.country) parts.push(address.country);

    const locationName = parts.length > 0 
      ? parts.join(', ') 
      : response.data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

    const result = {
      address: locationName,
      details: {
        building: address.building || address.house_number || null,
        street: address.road || address.street || null,
        suburb: address.neighbourhood || address.suburb || null,
        city: address.city || address.city_district || null,
        district: address.state_district || address.county || null,
        state: address.state || null,
        country: address.country || null,
        postalCode: address.postcode || null,
        formatted: response.data.display_name || null,
        accuracy: address.building || address.street ? 'exact' : 'general'
      },
      accuracy: address.building || address.street ? 'exact' : 'general'
    };

    locationCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;

  } catch (error) {
    console.error('Geocode error:', error.message);
    // Return coordinates immediately - don't hang
    return {
      address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      details: null,
      accuracy: 'general'
    };
  }
};

/**
 * Update location for an attendance record - FAST RESPONSE
 */
export const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude, deviceInfo = {} } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        error: 'Attendance record not found'
      });
    }

    // Get address (cached or fresh) - non-blocking
    const locationData = await getAddressFromCoords(
      parseFloat(latitude), 
      parseFloat(longitude)
    );

    // Update using schema methods
    await attendance.updateLocation(
      parseFloat(latitude),
      parseFloat(longitude),
      locationData.address,
      {
        ...deviceInfo,
        ip: req.headers['x-forwarded-for']?.split(',')[0] || 
            req.socket?.remoteAddress || 
            'unknown'
      }
    );

    attendance.locationDetails = locationData.details;
    if (locationData.details) {
      attendance.locationDetails.accuracy = locationData.accuracy;
    }
    await attendance.save();

    // 🔥 Fast response - don't wait for anything else
    return res.json({
      success: true,
      message: 'Location updated',
      data: {
        locationAddress: attendance.locationAddress,
        latitude: attendance.latitude,
        longitude: attendance.longitude,
        locationUpdatedAt: attendance.locationUpdatedAt,
        trackingEnabled: attendance.realTimeLocation?.enabled || false
      }
    });

  } catch (error) {
    console.error('Update location error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const enableRealTimeTracking = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) return res.status(404).json({ success: false, error: 'Not found' });
    await attendance.enableRealTimeTracking();
    return res.json({ success: true, data: { trackingEnabled: true } });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const disableRealTimeTracking = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) return res.status(404).json({ success: false, error: 'Not found' });
    await attendance.disableRealTimeTracking();
    return res.json({ success: true, data: { trackingEnabled: false } });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getLocationHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    const attendance = await Attendance.findById(id);
    if (!attendance) return res.status(404).json({ success: false, error: 'Not found' });

    const history = attendance.getLocationHistory(limit);

    return res.json({
      success: true,
      data: {
        currentLocation: attendance.latitude ? {
          latitude: attendance.latitude,
          longitude: attendance.longitude,
          locationAddress: attendance.locationAddress,
          updatedAt: attendance.locationUpdatedAt
        } : null,
        history,
        trackingEnabled: attendance.realTimeLocation?.enabled || false,
        totalHistory: attendance.realTimeLocation?.history?.length || 0
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const batchUpdateLocations = async (req, res) => {
  try {
    const records = await Attendance.findWithInvalidLocation();
    if (records.length === 0) {
      return res.json({ success: true, message: 'No records need updating', fixed: 0 });
    }

    let fixed = 0;
    for (const record of records) {
      try {
        const locationData = await getAddressFromCoords(record.latitude, record.longitude);
        record.locationAddress = locationData.address;
        record.locationDetails = locationData.details;
        record.locationUpdatedAt = new Date();
        await record.save();
        fixed++;
      } catch (error) {
        console.error('Batch update error for record:', record._id, error.message);
      }
    }

    return res.json({
      success: true,
      message: 'Batch update completed',
      fixed,
      total: records.length
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const findNearby = async (req, res) => {
  try {
    const { latitude, longitude, radius = 1, status } = req.query;
    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, error: 'Latitude and longitude are required' });
    }

    const records = await Attendance.findNearby(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(radius),
      status
    );

    return res.json({ success: true, data: records, count: records.length });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};