#!/usr/bin/env node

/**
 * Simple runner for TypeScript conversion
 */

import('./scripts/convert-js-to-ts.ts')
  .then(() => {
    console.log('✅ TypeScript conversion tool loaded successfully');
  })
  .catch((error) => {
    console.error('❌ Failed to load conversion tool:', error);
    process.exit(1);
  });
