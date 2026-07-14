import express from 'express';
import {
  reverseGeocodeController,
  batchReverseGeocodeController,
  searchGeocodeController,
  geocodeHealthCheck
} from '../Controllers/geocode.controller.js';

const router = express.Router();

/**
 * @route   GET /api/geocode/reverse
 * @desc    Reverse geocode coordinates to get location name
 * @query   lat - Latitude
 * @query   lon - Longitude
 * @query   detailed - (optional) Get detailed location data (true/false)
 * @access  Public
 */
router.get('/reverse', reverseGeocodeController);

/**
 * @route   POST /api/geocode/batch
 * @desc    Get location names for multiple coordinates
 * @body    { coordinates: [{lat, lon}, ...] }
 * @access  Public
 */
router.post('/batch', batchReverseGeocodeController);

/**
 * @route   GET /api/geocode/search
 * @desc    Search for location by query (forward geocode)
 * @query   query - Search query (e.g., "Bannu, Pakistan")
 * @access  Public
 */
router.get('/search', searchGeocodeController);

/**
 * @route   GET /api/geocode/health
 * @desc    Health check for geocode service
 * @access  Public
 */
router.get('/health', geocodeHealthCheck);

export default router;