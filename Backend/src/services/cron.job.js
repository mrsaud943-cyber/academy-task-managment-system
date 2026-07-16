// Backend/src/services/cron.job.js
import cron from 'node-cron';
import { autoMarkAbsent } from '../Controllers/attendance.controller.js';
import { getSettingValue } from '../Controllers/setting.controller.js';

/**
 * Start all cron jobs
 */
export const startCronJobs = () => {
  
  // ============================================
  // ✅ AUTO MARK ABSENT - Daily at 5:01 PM
  // ============================================
  // Cron pattern: 1 17 * * * (5:01 PM every day)
  cron.schedule('1 17 * * *', async () => {
    console.log('⏰ Running auto-mark absent job at 5:01 PM...');
    
    try {
      // Check if feature is enabled
      const isEnabled = await getSettingValue('autoMarkAbsent', false);
      
      if (!isEnabled) {
        console.log('⏰ Auto-mark absent is disabled in settings');
        return;
      }
      
      console.log('📢 Auto-mark absent job started...');
      const result = await autoMarkAbsent();
      
      if (result.success) {
        console.log(`✅ Auto-mark absent completed: ${result.absentCount} employees marked absent`);
        console.log(`📋 Absent employees: ${result.absentEmployees?.join(', ') || 'None'}`);
      } else {
        console.error('❌ Auto-mark absent failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Cron job error:', error.message);
    }
  });
  
  console.log('✅ Auto-mark absent cron job scheduled for 5:01 PM daily');
  
  // ============================================
  // ✅ OPTIONAL: Run at startup for testing
  // ============================================
  // Uncomment below to test on server start
  /*
  setTimeout(async () => {
    console.log('🧪 Running initial auto-mark absent test...');
    const isEnabled = await getSettingValue('autoMarkAbsent', false);
    if (isEnabled) {
      const result = await autoMarkAbsent();
      console.log('Test result:', result);
    }
  }, 10000);
  */
};

export default startCronJobs;