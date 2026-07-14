import express from 'express';
import {
  updateLocation,
  enableRealTimeTracking,
  disableRealTimeTracking,
  getLocationHistory,
  batchUpdateLocations,
  findNearby
} from '../Controllers/location.controller.js';

const router = express.Router();

// Update location for a specific attendance record
router.put('/attendance/:id/location', updateLocation);

// Enable real-time tracking
router.put('/attendance/:id/tracking/enable', enableRealTimeTracking);

// Disable real-time tracking
router.put('/attendance/:id/tracking/disable', disableRealTimeTracking);

// Get location history
router.get('/attendance/:id/location/history', getLocationHistory);

// Batch update all locations
router.post('/attendance/locations/batch-update', batchUpdateLocations);

// Find nearby attendance records
router.get('/attendance/nearby', findNearby);

export default router;