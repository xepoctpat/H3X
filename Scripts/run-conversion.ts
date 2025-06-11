#!/usr/bin/env node

/**
 * Simple runner for TypeScript conversion
 */

import('./convert-js-to-ts.js')
  .then(() => {
    console.log('✅ TypeScript conversion tool loaded successfully');
  })
  .catch((error) => {
    console.error('❌ Failed to load conversion tool:', error);
    process.exit(1);
  });
