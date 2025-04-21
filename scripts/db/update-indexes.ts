/**
 * Database Index Update Utility
 * 
 * This script updates indexes for all user databases in the system.
 * It's meant to be run periodically or after schema changes.
 * 
 * Usage:
 * npx ts-node scripts/db/update-indexes.ts
 */

import { updateAllUserDatabases } from '../../lib/user-db';
import { Logger } from '../../lib/logging/logger';

// Create a logger instance for this script
const logger = new Logger('scripts:update-indexes');

async function main() {
  try {
    console.log('Starting database index update process...');
    
    // Initialize the logger
    logger.info('Database index update initiated');
    
    // Run the update process
    const result = await updateAllUserDatabases();
    
    console.log(`Successfully updated ${result.count} databases`);
    logger.info('Database index update completed successfully', { count: result.count });
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating database indexes:', error);
    logger.error('Database index update failed', { error });
    
    process.exit(1);
  }
}

// Execute the script
main();
