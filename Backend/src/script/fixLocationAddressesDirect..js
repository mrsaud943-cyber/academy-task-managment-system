import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Attendance from '../models/Attendance.js';

dotenv.config();

const fixLocationAddresses = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find records with invalid location addresses
    const records = await Attendance.findWithInvalidLocation();
    
    console.log(`📊 Found ${records.length} records to fix`);
    
    if (records.length === 0) {
      console.log('✅ No records need fixing!');
      process.exit(0);
    }

    let fixed = 0;
    let failed = 0;

    // Process records
    for (const record of records) {
      try {
        // Generate a descriptive location from coordinates
        const lat = parseFloat(record.latitude).toFixed(6);
        const lng = parseFloat(record.longitude).toFixed(6);
        
        // You can enhance this with actual geocoding
        const address = `📍 Location at ${lat}, ${lng}`;
        
        record.locationAddress = address;
        record.locationUpdatedAt = new Date();
        await record.save();
        
        fixed++;
        console.log(`✅ Fixed record ${record._id}: ${address}`);
      } catch (error) {
        failed++;
        console.error(`❌ Failed to fix record ${record._id}:`, error.message);
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Fixed: ${fixed} records`);
    console.log(`❌ Failed: ${failed} records`);
    console.log(`📊 Total: ${records.length} records`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

fixLocationAddresses();