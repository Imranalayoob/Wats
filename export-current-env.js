#!/usr/bin/env node

/**
 * Export Current Environment Variables
 * Run this to get your current settings for migration
 */

console.log('🔍 Current Environment Variables for Migration:\n');

const envVars = [
  'DATABASE_URL',
  'NODE_ENV', 
  'PORT',
  'SESSION_SECRET',
  'BOT_SLEEP_START',
  'BOT_SLEEP_END', 
  'MAX_DAILY_VIDEOS',
  'CHROME_EXECUTABLE_PATH',
  'BASE_URL',
  'ADMIN_USERNAME'
];

const exportTemplate = [];

envVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Mask sensitive data
    if (varName === 'SESSION_SECRET' && value.length > 10) {
      console.log(`${varName}=${value.substring(0, 8)}... (${value.length} characters)`);
      exportTemplate.push(`${varName}=YOUR_NEW_SECRET_HERE`);
    } else if (varName === 'DATABASE_URL' && value.includes('postgresql://')) {
      console.log(`${varName}=postgresql://***:***@***:5432/*** (PostgreSQL detected)`);
      exportTemplate.push(`${varName}=postgresql://username:password@host:5432/database`);
    } else {
      console.log(`${varName}=${value}`);
      exportTemplate.push(`${varName}=${value}`);
    }
  } else {
    console.log(`${varName}=NOT_SET`);
    exportTemplate.push(`# ${varName}=value_needed`);
  }
});

console.log('\n📝 Template for new deployment:\n');
exportTemplate.forEach(line => console.log(line));

console.log('\n⚠️  Important Notes:');
console.log('- Generate new SESSION_SECRET for production');
console.log('- Update DATABASE_URL for new database');
console.log('- Set BASE_URL to your new domain/IP');
console.log('- Keep BOT_SLEEP_START/END and MAX_DAILY_VIDEOS as current values');