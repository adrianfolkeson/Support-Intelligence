import * as dotenv from 'dotenv';
import { startScheduler } from './scheduler';

dotenv.config();

console.log('🚀 Support Intelligence Starting...\n');

// Start the scheduler
startScheduler();

// Keep the process alive
console.log('Press Ctrl+C to stop\n');

process.on('SIGINT', () => {
  console.log('\n\nShutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\nShutting down gracefully...');
  process.exit(0);
});
