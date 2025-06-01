// H3X-merger.js
// H3X service: tracks and logs amendments (virtual proof steps) between modular and all-in-one HTML.
// Enhanced hexagonal lattice tracking with optimized fLupper triad components.

const fs = require('fs');
const path = require('path');

const MODULAR = 'index.modular.html';
const ALLINONE = 'index.allinone.html';
const LOG = 'flup-n-amendments.log';
const CONFIG_FILE = 'H3X-config.json';

// Enhanced log files for different loop types
const CFLUP_LOG = 'cFLup-instances.log';
const FLUPOUT_LOG = 'fLup-out-instances.log';
const FLUPRECURSE_LOG = 'fLup-recurse-instances.log';
const FLUPER_LOG = 'H3X-instances.log';

const MAX_LOG_SIZE = 512 * 1024; // 512 KB for optimal rotation

// Load H3X configuration
let h3xConfig = {
  timeAggregation: true,
  logDiffs: false,
  proofSync: false,
  verbose: true,
  enableSwapping: true,
  hexLatticeMode: true,
  triadPerfection: true
};

try {
  if (fs.existsSync(CONFIG_FILE)) {
    h3xConfig = { ...h3xConfig, ...JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) };
  }
} catch (e) {
  console.warn(`[H3X] Could not load config: ${e.message}`);
}

if (h3xConfig.verbose) {
  console.log('[H3X] Configuration loaded:', h3xConfig);
}

// Virtual state for the H3X proof system
let flupN = {
  amendments: [], // {timestamp, type, file, summary, diff}
  lastModular: '',
  lastAllinone: '',
  cFlupInstances: {}, // Track closed feedback loop instances
  fLupOutState: { amendments: [] },
  fLupRecurseState: { amendments: [] },
  h3xState: { amendments: [] }, // H3X merger state
  currentArchive: null
};

// Global counters
let cFlupCounter = 1;

// Load existing state from logs
function loadExistingState() {
  // Load general amendments
  if (fs.existsSync(LOG)) {
    try {
      const content = fs.readFileSync(LOG, 'utf8');
      const lines = content.split('\n').filter(Boolean);
      flupN.amendments = lines.map(line => JSON.parse(line));
    } catch (e) {
      if (h3xConfig.verbose) {
        console.warn(`[H3X] Could not load existing amendments: ${e.message}`);
      }
    }
  }

  // Load cFLup instances
  if (fs.existsSync(CFLUP_LOG)) {
    try {
      const content = fs.readFileSync(CFLUP_LOG, 'utf8');
      const lines = content.split('\n').filter(Boolean);
      lines.forEach(line => {
        const entry = JSON.parse(line);
        if (!flupN.cFlupInstances[entry.instanceId]) {
          flupN.cFlupInstances[entry.instanceId] = {
            created: entry.timestamp,
            amendments: []
          };
        }
        flupN.cFlupInstances[entry.instanceId].amendments.push(entry);
      });
      
      // Update counter to next available
      const maxId = Math.max(...Object.keys(flupN.cFlupInstances)
        .map(id => parseInt(id.replace('cFLup-', ''))), 0);
      cFlupCounter = maxId + 1;
    } catch (e) {
      if (h3xConfig.verbose) {
        console.warn(`[H3X] Could not load cFLup instances: ${e.message}`);
      }
    }
  }

  if (h3xConfig.verbose) {
    console.log(`[H3X] Loaded state: ${flupN.amendments.length} amendments, ${Object.keys(flupN.cFlupInstances).length} cFLup instances`);
  }
}

function readFileSafe(file) {
  try { return fs.readFileSync(file, 'utf8'); } catch { return ''; }
}

function rotateLogIfNeeded() {
  try {
    if (fs.existsSync(LOG)) {
      const stats = fs.statSync(LOG);
      if (stats.size > MAX_LOG_SIZE) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const archiveName = `flup-n-amendments-${timestamp}.log`;
        fs.renameSync(LOG, archiveName);
        if (h3xConfig.verbose) {
          console.log(`[H3X] Log rotated: ${archiveName}`);
        }
      }
    }
  } catch (e) {
    if (h3xConfig.verbose) {
      console.warn(`[H3X] Log rotation failed:`, e.message);
    }
  }
}

function logAmendment(type, file, summary, diff) {
  rotateLogIfNeeded();
  
  const entry = {
    timestamp: new Date().toISOString(),
    type, file, summary, diff,
    archive: flupN.currentArchive || 'live'
  };
  flupN.amendments.push(entry);
  fs.appendFileSync(LOG, JSON.stringify(entry) + '\n');
  if (h3xConfig.verbose) {
    console.log(`[H3X] Amendment logged: ${type} on ${file}`);
  }
}

// Enhanced Loop-Specific Logging
function logLoopAmendment(loopType, instanceId, summary, data, file = 'index.allinone.html') {
  rotateLoopLogIfNeeded(loopType);
  
  const entry = {
    timestamp: new Date().toISOString(),
    loopType,
    instanceId,
    summary,
    data,
    file,
    archive: flupN.currentArchive || 'live'
  };
  
  let logFile;
  switch (loopType) {
    case 'cFLup':
      logFile = CFLUP_LOG;
      if (!flupN.cFlupInstances[instanceId]) {
        flupN.cFlupInstances[instanceId] = {
          created: entry.timestamp,
          amendments: []
        };
      }
      flupN.cFlupInstances[instanceId].amendments.push(entry);
      break;
    case 'fLup-out':
      logFile = FLUPOUT_LOG;
      if (!flupN.fLupOutState.amendments) flupN.fLupOutState.amendments = [];
      flupN.fLupOutState.amendments.push(entry);
      break;
    case 'fLup-recurse':
      logFile = FLUPRECURSE_LOG;
      if (!flupN.fLupRecurseState.amendments) flupN.fLupRecurseState.amendments = [];
      flupN.fLupRecurseState.amendments.push(entry);
      break;
    case 'H3X':
      logFile = FLUPER_LOG;
      if (!flupN.h3xState.amendments) flupN.h3xState.amendments = [];
      flupN.h3xState.amendments.push(entry);
      break;
    default:
      logAmendment(loopType, file, summary, JSON.stringify(data));
      return;
  }
  
  fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
  flupN.amendments.push(entry);
  
  if (h3xConfig.verbose) {
    console.log(`[${loopType}] ${instanceId || 'instance'}: ${summary}`);
  }
}

function rotateLoopLogIfNeeded(loopType) {
  const logFiles = {
    'cFLup': CFLUP_LOG,
    'fLup-out': FLUPOUT_LOG,
    'fLup-recurse': FLUPRECURSE_LOG,
    'H3X': FLUPER_LOG
  };
  
  const logFile = logFiles[loopType];
  if (!logFile) return;
  
  try {
    if (fs.existsSync(logFile)) {
      const stats = fs.statSync(logFile);
      if (stats.size > MAX_LOG_SIZE) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const archiveName = `${loopType}-instances-${timestamp}.log`;
        fs.renameSync(logFile, archiveName);
        if (h3xConfig.verbose) {
          console.log(`[H3X] ${loopType} log rotated: ${archiveName}`);
        }
      }
    }
  } catch (e) {
    if (h3xConfig.verbose) {
      console.warn(`[H3X] ${loopType} log rotation failed:`, e.message);
    }
  }
}

function createNewCFlupInstance() {
  const instanceId = `cFLup-${String(cFlupCounter).padStart(2, '0')}`;
  cFlupCounter++;
  
  logLoopAmendment('cFLup', instanceId, 'New closed feedback loop instance created', {
    createdAt: new Date().toISOString(),
    counter: cFlupCounter - 1
  });
  
  return instanceId;
}

function getCFlupInstanceCount() {
  return Object.keys(flupN.cFlupInstances).length;
}

// Main execution
loadExistingState();

// CLI command handling
const command = process.argv[2];

switch (command) {
  case 'create-cflup':
    const newInstance = createNewCFlupInstance();
    console.log(`[H3X] Created new instance: ${newInstance}`);
    break;
    
  case 'list-cflups':
    console.log(`[H3X] Total cFLup instances: ${getCFlupInstanceCount()}`);
    Object.keys(flupN.cFlupInstances).forEach(id => {
      const instance = flupN.cFlupInstances[id];
      console.log(`  ${id}: Created ${instance.created}, ${instance.amendments.length} amendments`);
    });
    break;
    
  case 'export-loop-archive':
    const loopType = process.argv[3];
    const outputFile = process.argv[4] || `${loopType}-complete-archive-${new Date().toISOString().split('T')[0]}.json`;
    
    let exportData = [];
    
    switch (loopType) {
      case 'cFLup':
        exportData = Object.values(flupN.cFlupInstances).flatMap(instance => instance.amendments);
        break;
      case 'fLup-out':
        exportData = flupN.fLupOutState.amendments || [];
        break;
      case 'fLup-recurse':
        exportData = flupN.fLupRecurseState.amendments || [];
        break;
      case 'H3X':
        exportData = flupN.h3xState.amendments || [];
        break;
      default:
        console.error(`[H3X] Unknown loop type: ${loopType}`);
        process.exit(1);
    }
    
    if (exportData.length === 0) {
      console.log(`[H3X] No data to export for ${loopType}`);
      process.exit(0);
    }
    
    fs.writeFileSync(outputFile, JSON.stringify(exportData, null, 2));
    console.log(`[H3X] Exported ${exportData.length} entries to ${outputFile}`);
    break;
    
  case 'status':
    console.log('--- H3X System Status ---');
    console.log(`Total amendments: ${flupN.amendments.length}`);
    console.log(`cFLup instances: ${getCFlupInstanceCount()}`);
    console.log(`fLup-out amendments: ${flupN.fLupOutState.amendments?.length || 0}`);
    console.log(`fLup-recurse amendments: ${flupN.fLupRecurseState.amendments?.length || 0}`);
    console.log(`H3X amendments: ${flupN.h3xState.amendments?.length || 0}`);
    console.log(`Current archive: ${flupN.currentArchive || 'live'}`);
    console.log('------------------------');
    break;
    
  default:
    if (!command) {
      // Run normal service
      console.log('[H3X] H3X service running...');
      // Main service logic would go here
    } else {
      console.log(`[H3X] Available commands:
  create-cflup              - Create new cFLup instance
  list-cflups              - List all cFLup instances  
  export-loop-archive <type> [file] - Export loop archive
  status                   - Show system status
  
H3X Loop Types: cFLup, fLup-out, fLup-recurse, H3X`);
    }
}
