#!/usr/bin/env node

/**
 * Random Keep-Alive Script
 * 
 * This script calls the keep-alive endpoint with randomized timing
 * between 72-96 hours (3-4 days) to prevent Supabase database pausing.
 * 
 * Usage:
 * 1. Set CRON_SECRET in your environment variables
 * 2. Run this script via cron-job.org or similar service
 * 3. Schedule it to run every 72 hours (it will randomize internally)
 * 
 * Or use with node-cron locally:
 * npm install node-cron
 * node scripts/keep-alive-random.js
 */

const BASE_URL = process.env.KEEP_ALIVE_URL || 'https://project4-cast.vercel.app';
const CRON_SECRET = process.env.CRON_SECRET;

// Randomize between 72-96 hours (in milliseconds)
const MIN_HOURS = 72;
const MAX_HOURS = 96;
const MIN_MS = MIN_HOURS * 60 * 60 * 1000;
const MAX_MS = MAX_HOURS * 60 * 60 * 1000;

function getRandomDelay() {
  return Math.floor(Math.random() * (MAX_MS - MIN_MS) + MIN_MS);
}

async function keepAlive() {
  const url = `${BASE_URL}/api/cron/keep-alive`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Keep-alive successful:`, data);
      return true;
    } else {
      console.error(`❌ Keep-alive failed:`, data);
      return false;
    }
  } catch (error) {
    console.error(`❌ Keep-alive error:`, error);
    return false;
  }
}

// If running directly (not imported)
if (require.main === module) {
  keepAlive().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { keepAlive, getRandomDelay };

