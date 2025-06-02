// H3Xbase-merger.js
// H3Xbase Service: Advanced hexagonal base tracking and logging system for fLupper triad amendments
// Tracks virtual proof steps between modular and all-in-one HTML workspaces
// Enhanced with loop type separation and optimized fLupper triad components

const fs = require('fs');
const path = require('path');

const MODULAR = 'index.modular.html';
const ALLINONE = 'index.allinone.html';
const LOG = 'flup-n-amendments.log'; // Keep for backward compatibility
const MAX_LOG_SIZE = 512 * 1024; // 512 KB threshold for rotation

// --- Separate Log Files for Each Loop Type ---
const FLUPER_LOG = 'H3Xbase-amendments.log'; // H3Xbase merger itself
const CFLUP_LOG = 'cFLup-instances.log';    // closed feedback loops
const FLUPOUT_LOG = 'fLup-out.log';         // outbound loops  
const FLUPRECURSE_LOG = 'fLup-recurse.log'; // recursive loops

// --- Loop Instance Counter ---
let cFlupCounter = 1; // Incremental counter for cFLup-NN instances

// --- H3Xbase Optimized Configuration ---
const CONFIG_FILE = 'H3Xbase-config.json';
const h3xbaseConfig = {
  timeAggregation: true, // Aggregate time-based changes before syncing
  logDiffs: false,       // Log file diffs (not just summary)
  proofSync: true,       // Sync mathematical proof tab content
  verbose: true,         // Extra logging
  enableSwapping: true,  // Allow swapping flup-n states from archived logs
  hexLatticeMode: true,  // Enable hexagonal lattice optimizations
  triadPerfection: true  // Perfect fLupper triad components
};

// Virtual state for the H3Xbase proof system
let flupN = {
  amendments: [], // {timestamp, type, file, summary, diff}
  lastModular: '',
  lastAllinone: '',
  currentArchive: null, // Track which archive is currently active (if any)
  cFlupInstances: {}, // Track individual cFLup-NN instances
  fLupOutState: {},   // Track fLup-out state
  fLupRecurseState: {}, // Track fLup-recurse state
  h3xbaseState: {}    // Track H3Xbase merger state (formerly fLuper)
};

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
        if (h3xbaseConfig.verbose) {
          console.log(`[H3Xbase] Log rotated: ${archiveName} (${(stats.size/1024).toFixed(1)} KB)`);
        }
        return archiveName;
      }
    }
  } catch (e) {
    if (h3xbaseConfig.verbose) {
      console.warn(`[H3Xbase] Log rotation failed:`, e.message);
    }
  }
  return null;
}

function getArchivedLogFiles() {
  try {
    return fs.readdirSync('.')
      .filter(file => file.startsWith('flup-n-amendments-') && file.endsWith('.log'))
      .sort()
      .reverse(); // Most recent first
  } catch (e) {
    if (h3xbaseConfig.verbose) {
      console.warn(`[H3Xbase] Could not list archived logs:`, e.message);
    }
    return [];
  }
}

function loadFlupNFromArchive(archiveFile) {
  if (!h3xbaseConfig.enableSwapping) {
    console.warn(`[H3Xbase] Swapping disabled in config`);
    return false;
  }
  
  try {
    const archiveContent = fs.readFileSync(archiveFile, 'utf8');
    const archivedAmendments = archiveContent
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line));
    
    // Backup current state before swapping
    if (flupN.amendments.length > 0) {
      const backupName = `flup-n-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      fs.writeFileSync(backupName, JSON.stringify(flupN, null, 2));
      if (h3xbaseConfig.verbose) {
        console.log(`[H3Xbase] Current state backed up to: ${backupName}`);
      }
    }
    
    // Load archived state
    flupN.amendments = archivedAmendments;
    flupN.currentArchive = archiveFile;
    
    if (h3xbaseConfig.verbose) {
      console.log(`[H3Xbase] Loaded ${archivedAmendments.length} amendments from ${archiveFile}`);
    }
    return true;
  } catch (e) {
    console.error(`[H3Xbase] Failed to load archive ${archiveFile}:`, e.message);
    return false;
  }
}

function restoreFromBackup(backupFile) {
  try {
    const backupContent = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    flupN = { ...backupContent };
    if (h3xbaseConfig.verbose) {
      console.log(`[H3Xbase] Restored state from backup: ${backupFile}`);
    }
    return true;
  } catch (e) {
    console.error(`[H3Xbase] Failed to restore from backup ${backupFile}:`, e.message);
    return false;
  }
}

function logAmendment(type, file, summary, diff) {
  rotateLogIfNeeded(); // Check and rotate log if needed
  
  const entry = {
    timestamp: new Date().toISOString(),
    type, file, summary, diff,
    archive: flupN.currentArchive || 'live' // Track source
  };
  flupN.amendments.push(entry);
  fs.appendFileSync(LOG, JSON.stringify(entry) + '\n');
  if (h3xbaseConfig.verbose) {
    console.log(`[H3Xbase] Amendment logged: ${type} on ${file}`);
  }
}

// --- Enhanced Loop-Specific Logging ---
function logLoopAmendment(loopType, instanceId, summary, data, file = 'index.allinone.html') {
  // Rotate log if needed before adding new entry
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
    case 'fLuper':
      logFile = FLUPER_LOG;
      if (!flupN.fLuperState.amendments) flupN.fLuperState.amendments = [];
      flupN.fLuperState.amendments.push(entry);
      break;
    default:
      // Fallback to general log
      logAmendment(loopType, file, summary, JSON.stringify(data));
      return;
  }
  
  // Write to specific loop type log file
  fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
  
  // Also add to main amendments for backward compatibility
  flupN.amendments.push(entry);
  
  if (h3xbaseConfig.verbose) {
    console.log(`[${loopType}] ${instanceId || 'instance'}: ${summary}`);
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

function getLoopTypeSummary(loopType) {
  switch (loopType) {
    case 'cFLup':
      return {
        totalInstances: getCFlupInstanceCount(),
        instances: Object.keys(flupN.cFlupInstances),
        nextId: `cFLup-${String(cFlupCounter).padStart(2, '0')}`
      };
    case 'fLup-out':
      return {
        amendmentCount: flupN.fLupOutState.amendments?.length || 0,
        lastUpdate: flupN.fLupOutState.amendments?.slice(-1)[0]?.timestamp || 'never'
      };
    case 'fLup-recurse':
      return {
        amendmentCount: flupN.fLupRecurseState.amendments?.length || 0,
        lastUpdate: flupN.fLupRecurseState.amendments?.slice(-1)[0]?.timestamp || 'never'
      };
    case 'fLuper':
      return {
        amendmentCount: flupN.fLuperState.amendments?.length || 0,
        lastUpdate: flupN.fLuperState.amendments?.slice(-1)[0]?.timestamp || 'never'
      };
    default:
      return { error: 'Unknown loop type' };
  }
}

function listArchivedStates() {
  console.log('--- Archived flup-n States ---');
  const archives = getArchivedLogFiles();
  if (archives.length === 0) {
    console.log('No archived states found.');
  } else {
    archives.forEach((archive, i) => {
      try {
        const content = fs.readFileSync(archive, 'utf8');
        const amendmentCount = content.split('\n').filter(Boolean).length;
        const stats = fs.statSync(archive);
        console.log(`${i+1}. ${archive} (${amendmentCount} amendments, ${(stats.size/1024).toFixed(1)} KB)`);
      } catch (e) {
        console.log(`${i+1}. ${archive} (error reading file)`);
      }
    });
  }
  console.log('------------------------------');
}

function checkAndLogAmendments() {
  const modular = readFileSafe(MODULAR);
  const allinone = readFileSafe(ALLINONE);
  
  // Process flup-n specific logs first
  processFlupNLogs();
  
  if (flupN.lastModular && modular !== flupN.lastModular) {
    logAmendment('modular-edit', MODULAR, 'Detected change in modular workspace', getDiff(flupN.lastModular, modular));
  }
  if (flupN.lastAllinone && allinone !== flupN.lastAllinone) {
    logAmendment('allinone-edit', ALLINONE, 'Detected change in all-in-one workspace', getDiff(flupN.lastAllinone, allinone));
  }
  flupN.lastModular = modular;
  flupN.lastAllinone = allinone;
}

function printFlupNState() {
  console.log('--- fLup-n Virtual Proof State ---');
  console.log('Amendments:');
  flupN.amendments.forEach((a, i) => {
    console.log(`${i+1}. [${a.timestamp}] ${a.type} on ${a.file}: ${a.summary}`);
    if (h3xbaseConfig.logDiffs && a.diff) {
      console.log(a.diff);
    }
  });
  console.log('----------------------------------');
}

function printExperimentalConfig() {
  console.log('--- H3Xbase Experimental Features ---');
  Object.entries(h3xbaseConfig).forEach(([k, v]) => {
    console.log(`${k}: ${v}`);
  });
  console.log('--------------------------------------');
}

function loadConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
    const cfg = JSON.parse(raw);
    if (typeof cfg.timeAggregation === 'boolean') h3xbaseConfig.timeAggregation = cfg.timeAggregation;
    // Support both 'diffLogging' and 'logDiffs' for compatibility
    if (typeof cfg.diffLogging === 'boolean') h3xbaseConfig.logDiffs = cfg.diffLogging;
    if (typeof cfg.logDiffs === 'boolean') h3xbaseConfig.logDiffs = cfg.logDiffs;
    if (typeof cfg.proofSync === 'boolean') h3xbaseConfig.proofSync = cfg.proofSync;
    if (typeof cfg.verbose === 'boolean') h3xbaseConfig.verbose = cfg.verbose;
    if (typeof cfg.enableSwapping === 'boolean') h3xbaseConfig.enableSwapping = cfg.enableSwapping;
  } catch (e) {
    if (h3xbaseConfig.verbose) {
      console.warn(`[H3Xbase] Could not load config from ${CONFIG_FILE}:`, e.message);
    }
  }
}

// --- flup-n Specific Log Processing ---
const FLUP_N_LOG = 'flup-n-specific.log';

function processFlupNLogs() {
  // Check if browser localStorage has flup-n logs
  // This would normally require a browser automation tool, but we'll simulate
  // by checking for a flup-n specific log file that the browser could write
  
  if (fs.existsSync(FLUP_N_LOG)) {
    try {
      const flupNContent = fs.readFileSync(FLUP_N_LOG, 'utf8');
      const flupNLogs = flupNContent.split('\n').filter(Boolean).map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      }).filter(Boolean);
      
      flupNLogs.forEach(log => {
        if (log.source === 'allinone-flup-n') {
          let loopType = 'fLuper'; // Default to fLuper
          let instanceId = null;
          
          // Determine loop type from log data
          if (log.data && log.data.loopType) {
            loopType = log.data.loopType;
            instanceId = log.data.instanceId;
          } else if (log.type) {
            // Legacy support - map old types to new loop types
            if (log.type === 'closed-feedback' || log.type.includes('cflup') || log.type.includes('cFLup')) {
              loopType = 'cFLup';
              // Generate instance ID if not provided
              if (!instanceId) {
                instanceId = createNewCFlupInstance();
              }
            } else if (log.type === 'outbound' || log.type.includes('fLup-out')) {
              loopType = 'fLup-out';
            } else if (log.type === 'recursive' || log.type.includes('fLup-recurse')) {
              loopType = 'fLup-recurse';
            }
          }
          
          // Route to specific loop type logging
          logLoopAmendment(loopType, instanceId, log.message, log.data || {});
        }
      });
      
      if (h3xbaseConfig.verbose && flupNLogs.length > 0) {
        console.log(`[H3Xbase] Processed ${flupNLogs.length} flup-n specific logs and routed to loop type archives`);
      }
      
      // Clear processed logs
      fs.writeFileSync(FLUP_N_LOG, '');
      
    } catch (e) {
      if (h3xbaseConfig.verbose) {
        console.warn(`[H3Xbase] Failed to process flup-n logs:`, e.message);
      }
    }
  }
}

function getFlupNLogSummary() {
  const flupNAmendments = flupN.amendments.filter(a => a.type.startsWith('flup-n-'));
  const summary = {
    total: flupNAmendments.length,
    byType: {},
    recent: flupNAmendments.slice(-5).map(a => ({
      timestamp: a.timestamp,
      type: a.type,
      summary: a.summary
    })),
    loopTypes: {
      cFLup: getLoopTypeSummary('cFLup'),
      fLupOut: getLoopTypeSummary('fLup-out'),
      fLupRecurse: getLoopTypeSummary('fLup-recurse'),
      fLuper: getLoopTypeSummary('fLuper')
    }
  };
  
  flupNAmendments.forEach(a => {
    const baseType = a.type.replace('flup-n-', '');
    summary.byType[baseType] = (summary.byType[baseType] || 0) + 1;
  });
  
  return summary;
}

// Load config at startup
loadConfig();

// --- Load Existing Logs into Virtual State ---
function loadExistingLogsIntoState() {
  // Load cFLup instances
  if (fs.existsSync(CFLUP_LOG)) {
    try {
      const content = fs.readFileSync(CFLUP_LOG, 'utf8');
      const entries = content.split('\n').filter(Boolean).map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      }).filter(Boolean);
      
      entries.forEach(entry => {
        if (entry.instanceId) {
          if (!flupN.cFlupInstances[entry.instanceId]) {
            flupN.cFlupInstances[entry.instanceId] = {
              created: entry.timestamp,
              amendments: []
            };
          }
          flupN.cFlupInstances[entry.instanceId].amendments.push(entry);
          
          // Update counter based on highest instance ID
          const idMatch = entry.instanceId.match(/cFLup-(\d+)/);
          if (idMatch) {
            const instanceNum = parseInt(idMatch[1]);
            cFlupCounter = Math.max(cFlupCounter, instanceNum + 1);
          }
        }
      });
    } catch (e) {
      if (h3xbaseConfig.verbose) {
        console.warn(`[H3Xbase] Failed to load cFLup log:`, e.message);
      }
    }
  }
  
  // Load other loop types
  const loadLoopState = (logFile, stateKey) => {
    if (fs.existsSync(logFile)) {
      try {
        const content = fs.readFileSync(logFile, 'utf8');
        const entries = content.split('\n').filter(Boolean).map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        }).filter(Boolean);
        
        if (!flupN[stateKey].amendments) flupN[stateKey].amendments = [];
        flupN[stateKey].amendments = entries;
      } catch (e) {
        if (h3xbaseConfig.verbose) {
          console.warn(`[H3Xbase] Failed to load ${logFile}:`, e.message);
        }
      }
    }
  };
  
  loadLoopState(FLUPOUT_LOG, 'fLupOutState');
  loadLoopState(FLUPRECURSE_LOG, 'fLupRecurseState');
  loadLoopState(FLUPER_LOG, 'fLuperState');
  
  if (h3xbaseConfig.verbose) {
    console.log(`[H3Xbase] Loaded existing logs into virtual state:`);
    console.log(`  cFLup instances: ${Object.keys(flupN.cFlupInstances).length}`);
    console.log(`  fLup-out entries: ${flupN.fLupOutState.amendments?.length || 0}`);
    console.log(`  fLup-recurse entries: ${flupN.fLupRecurseState.amendments?.length || 0}`);
    console.log(`  fLuper entries: ${flupN.fLuperState.amendments?.length || 0}`);
    console.log(`  cFlup counter: ${cFlupCounter}`);
  }
}

// Load existing logs into virtual state at startup
loadExistingLogsIntoState();

// Command line interface for testing archive functions
const args = process.argv.slice(2);
if (args.length > 0) {
  switch (args[0]) {
    case 'list-archives':
      listArchivedStates();
      break;
    case 'load-archive':
      if (args[1]) {
        const success = loadFlupNFromArchive(args[1]);
        if (success) {
          console.log(`Successfully loaded archive: ${args[1]}`);
          printFlupNState();
        }
      } else {
        console.log('Usage: node v-merger.js load-archive <archive-filename>');
      }
      break;    case 'restore-backup':
      if (args[1]) {
        const success = restoreFromBackup(args[1]);
        if (success) {
          console.log(`Successfully restored backup: ${args[1]}`);
          printFlupNState();
        }
      } else {
        console.log('Usage: node v-merger.js restore-backup <backup-filename>');
      }
      break;    case 'flup-n-summary':
      const summary = getFlupNLogSummary();
      console.log('--- flup-n Specific Log Summary ---');
      console.log(`Total flup-n logs: ${summary.total}`);
      console.log('By type:');
      Object.entries(summary.byType).forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });
      console.log('Recent logs:');
      summary.recent.forEach((log, i) => {
        console.log(`  ${i+1}. [${log.timestamp}] ${log.type}: ${log.summary}`);
      });
      console.log('\nLoop Type Status:');
      Object.entries(summary.loopTypes).forEach(([type, info]) => {
        console.log(`  ${type}:`, JSON.stringify(info, null, 4));
      });
      console.log('----------------------------------');
      break;
    case 'create-cflup':
      const newInstance = createNewCFlupInstance();
      console.log(`Created new closed feedback loop: ${newInstance}`);
      break;
    case 'list-cflups':
      const cflupSummary = getLoopTypeSummary('cFLup');
      console.log('--- cFLup Instances ---');
      console.log(`Total instances: ${cflupSummary.totalInstances}`);
      console.log(`Next ID: ${cflupSummary.nextId}`);
      console.log('Instances:');
      cflupSummary.instances.forEach((id, i) => {
        const instance = flupN.cFlupInstances[id];
        console.log(`  ${i+1}. ${id} (created: ${instance.created}, amendments: ${instance.amendments.length})`);
      });
      console.log('----------------------');
      break;    case 'loop-status':
      const loopType = args[1];
      if (!loopType) {
        console.log('Usage: node v-merger.js loop-status <cFLup|fLup-out|fLup-recurse|fLuper>');
        break;
      }
      const status = getLoopTypeSummary(loopType);
      console.log(`--- ${loopType} Status ---`);
      console.log(JSON.stringify(status, null, 2));
      console.log('------------------------');
      break;
    case 'list-loop-archives':
      if (args[1]) {
        // List archives for specific loop type
        const specificLoopType = args[1];
        const specificArchives = getLoopArchiveFiles(specificLoopType);
        console.log(`--- ${specificLoopType} Archives ---`);
        if (specificArchives.length === 0) {
          console.log('No archived files found.');
        } else {
          specificArchives.forEach((archive, i) => {
            try {
              const content = fs.readFileSync(archive, 'utf8');
              const entryCount = content.split('\n').filter(Boolean).length;
              const stats = fs.statSync(archive);
              console.log(`${i+1}. ${archive} (${entryCount} entries, ${(stats.size/1024).toFixed(1)} KB)`);
            } catch (e) {
              console.log(`${i+1}. ${archive} (error reading file)`);
            }
          });
        }
        console.log('--------------------------------');
      } else {
        // List all loop type archives
        listAllLoopArchives();
      }
      break;
    case 'export-loop-archive':
      const exportLoopType = args[1];
      const exportFile = args[2];
      if (!exportLoopType) {
        console.log('Usage: node v-merger.js export-loop-archive <cFLup|fLup-out|fLup-recurse|fLuper> [output-file]');
        break;
      }
      const success = exportLoopTypeArchive(exportLoopType, exportFile);
      if (success) {
        console.log(`Successfully exported ${exportLoopType} archive`);
      }
      break;
    case 'archive-usage':
      console.log('--- Archive Usage Summary ---');
      const loopTypes = ['cFLup', 'fLup-out', 'fLup-recurse', 'fLuper'];
      let totalSize = 0;
      let totalFiles = 0;
      
      loopTypes.forEach(loopType => {
        const archives = getLoopArchiveFiles(loopType);
        let loopSize = 0;
        archives.forEach(archive => {
          try {
            const stats = fs.statSync(archive);
            loopSize += stats.size;
          } catch (e) {}
        });
        
        // Add current log file size
        let currentLogFile;
        switch (loopType) {
          case 'cFLup': currentLogFile = CFLUP_LOG; break;
          case 'fLup-out': currentLogFile = FLUPOUT_LOG; break;
          case 'fLup-recurse': currentLogFile = FLUPRECURSE_LOG; break;
          case 'fLuper': currentLogFile = FLUPER_LOG; break;
        }
        
        if (currentLogFile && fs.existsSync(currentLogFile)) {
          try {
            const stats = fs.statSync(currentLogFile);
            loopSize += stats.size;
          } catch (e) {}
        }
        
        totalSize += loopSize;
        totalFiles += archives.length + (currentLogFile && fs.existsSync(currentLogFile) ? 1 : 0);
        
        console.log(`${loopType}: ${archives.length} archives + current log = ${(loopSize/1024).toFixed(1)} KB`);
      });
        console.log(`\nTotal: ${totalFiles} files, ${(totalSize/1024).toFixed(1)} KB`);
      console.log('-----------------------------');
      break;
    case 'import-loop-archive':
      const importArchiveFile = args[1];
      const importOptions = {};
      
      // Parse options
      if (args.includes('--replace')) {
        importOptions.merge = false;
      }
      if (args.includes('--no-validate')) {
        importOptions.validate = false;
      }
      if (args.includes('--no-counters')) {
        importOptions.updateCounters = false;
      }
      
      if (!importArchiveFile) {
        console.log('Usage: node v-merger.js import-loop-archive <archive-file> [--replace] [--no-validate] [--no-counters]');
        console.log('Options:');
        console.log('  --replace      Replace existing logs instead of merging (default: merge)');
        console.log('  --no-validate  Skip archive integrity validation');
        console.log('  --no-counters  Don\'t update instance counters from imported data');
        break;
      }
      
      const importSuccess = importLoopTypeArchive(importArchiveFile, importOptions);
      if (importSuccess) {
        console.log(`Successfully imported archive: ${importArchiveFile}`);
        console.log('\nRun "node v-merger.js flup-n-summary" to see updated status');
      } else {
        console.log(`Failed to import archive: ${importArchiveFile}`);
      }
      break;
    case 'import-multiple-archives':
      if (args.length < 2) {
        console.log('Usage: node v-merger.js import-multiple-archives <archive1> <archive2> ... [--replace] [--no-validate] [--no-counters]');
        break;
      }
      
      const archiveFiles = args.slice(1).filter(arg => !arg.startsWith('--'));
      const multiImportOptions = {};
      
      // Parse options
      if (args.includes('--replace')) {
        multiImportOptions.merge = false;
      }
      if (args.includes('--no-validate')) {
        multiImportOptions.validate = false;
      }
      if (args.includes('--no-counters')) {
        multiImportOptions.updateCounters = false;
      }
      
      const results = importMultipleArchives(archiveFiles, multiImportOptions);
      break;
    case 'validate-archive':
      const validateFile = args[1];
      if (!validateFile) {
        console.log('Usage: node v-merger.js validate-archive <archive-file>');
        break;
      }
      
      const isValid = validateArchiveIntegrity(validateFile);
      if (isValid) {
        console.log(`✅ Archive validation passed: ${validateFile}`);
      } else {
        console.log(`❌ Archive validation failed: ${validateFile}`);
      }
      break;default:
      console.log('Available commands:');
      console.log('  list-archives - List all archived log files (legacy)');
      console.log('  load-archive <file> - Load flup-n state from archived log');
      console.log('  restore-backup <file> - Restore flup-n state from backup');
      console.log('  flup-n-summary - Show summary of flup-n specific logs');
      console.log('  create-cflup - Create a new cFLup-NN instance');
      console.log('  list-cflups - List all cFLup instances');
      console.log('  loop-status <type> - Show status of specific loop type');
      console.log('');      console.log('--- Loop Type Archive Management ---');
      console.log('  list-loop-archives [type] - List archives for specific loop type or all');
      console.log('  export-loop-archive <type> [file] - Export complete archive for loop type');
      console.log('  archive-usage - Show storage usage summary for all loop types');
      console.log('');
      console.log('--- Import/Export Commands ---');
      console.log('  import-loop-archive <file> [options] - Import a loop type archive');
      console.log('  import-multiple-archives <file1> <file2> ... [options] - Import multiple archives');
      console.log('  validate-archive <file> - Validate archive integrity');
      console.log('');
      console.log('Import options: --replace (replace instead of merge), --no-validate, --no-counters');
      console.log('Loop types: cFLup, fLup-out, fLup-recurse, fLuper');
      break;
  }
} else {
  // Main mock-up service loop (single run for now)
  printExperimentalConfig();
  checkAndLogAmendments();
  processFlupNLogs();
  printFlupNState();
  console.log('fLup-n mock-up service: amendments tracked and logged.');
}

// --- Archive Management for Loop Types ---
function rotateLoopLogIfNeeded(loopType) {
  let logFile;
  let archivePrefix;
  
  switch (loopType) {
    case 'cFLup':
      logFile = CFLUP_LOG;
      archivePrefix = 'cFLup-instances-archive';
      break;
    case 'fLup-out':
      logFile = FLUPOUT_LOG;
      archivePrefix = 'fLup-out-archive';
      break;
    case 'fLup-recurse':
      logFile = FLUPRECURSE_LOG;
      archivePrefix = 'fLup-recurse-archive';
      break;
    case 'fLuper':
      logFile = FLUPER_LOG;
      archivePrefix = 'fLuper-amendments-archive';
      break;
    default:
      return null;
  }
  
  try {
    if (fs.existsSync(logFile)) {
      const stats = fs.statSync(logFile);
      if (stats.size > MAX_LOG_SIZE) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const archiveName = `${archivePrefix}-${timestamp}.log`;
        fs.renameSync(logFile, archiveName);
        if (h3xbaseConfig.verbose) {
          console.log(`[H3Xbase] ${loopType} log rotated: ${archiveName} (${(stats.size/1024).toFixed(1)} KB)`);
        }
        return archiveName;
      }
    }
  } catch (e) {
    if (h3xbaseConfig.verbose) {
      console.warn(`[H3Xbase] ${loopType} log rotation failed:`, e.message);
    }
  }
  return null;
}

function getLoopArchiveFiles(loopType) {
  let archivePrefix;
  switch (loopType) {
    case 'cFLup':
      archivePrefix = 'cFLup-instances-archive';
      break;
    case 'fLup-out':
      archivePrefix = 'fLup-out-archive';
      break;
    case 'fLup-recurse':
      archivePrefix = 'fLup-recurse-archive';
      break;
    case 'fLuper':
      archivePrefix = 'fLuper-amendments-archive';
      break;
    default:
      return [];
  }
  
  try {
    return fs.readdirSync('.')
      .filter(file => file.startsWith(archivePrefix) && file.endsWith('.log'))
      .sort()
      .reverse(); // Most recent first
  } catch (e) {
    if (h3xbaseConfig.verbose) {
      console.warn(`[H3Xbase] Could not list ${loopType} archived logs:`, e.message);
    }
    return [];
  }
}

function listAllLoopArchives() {
  console.log('--- Loop Type Archives ---');
  const loopTypes = ['cFLup', 'fLup-out', 'fLup-recurse', 'fLuper'];
  
  loopTypes.forEach(loopType => {
    const archives = getLoopArchiveFiles(loopType);
    console.log(`\n${loopType} Archives (${archives.length}):`);
    if (archives.length === 0) {
      console.log('  No archived files found.');
    } else {
      archives.slice(0, 5).forEach((archive, i) => { // Show max 5 most recent
        try {
          const content = fs.readFileSync(archive, 'utf8');
          const entryCount = content.split('\n').filter(Boolean).length;
          const stats = fs.statSync(archive);
          console.log(`  ${i+1}. ${archive} (${entryCount} entries, ${(stats.size/1024).toFixed(1)} KB)`);
        } catch (e) {
          console.log(`  ${i+1}. ${archive} (error reading file)`);
        }
      });
      if (archives.length > 5) {
        console.log(`  ... and ${archives.length - 5} more archives`);
      }
    }
  });
  console.log('-------------------------');
}

function exportLoopTypeArchive(loopType, outputFile = null) {
  if (!outputFile) {
    outputFile = `${loopType}-complete-archive-${new Date().toISOString().split('T')[0]}.json`;
  }
  
  const archives = getLoopArchiveFiles(loopType);
  let allEntries = [];
  
  // Read current log file
  let currentLogFile;
  switch (loopType) {
    case 'cFLup': currentLogFile = CFLUP_LOG; break;
    case 'fLup-out': currentLogFile = FLUPOUT_LOG; break;
    case 'fLup-recurse': currentLogFile = FLUPRECURSE_LOG; break;
    case 'fLuper': currentLogFile = FLUPER_LOG; break;
    default: 
      console.error(`Unknown loop type: ${loopType}`);
      return false;
  }
  
  try {
    // Add current log entries
    if (fs.existsSync(currentLogFile)) {
      const currentContent = fs.readFileSync(currentLogFile, 'utf8');
      const currentEntries = currentContent.split('\n').filter(Boolean).map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      }).filter(Boolean);
      allEntries = allEntries.concat(currentEntries);
    }
    
    // Add archived entries
    archives.forEach(archiveFile => {
      try {
        const archiveContent = fs.readFileSync(archiveFile, 'utf8');
        const archiveEntries = archiveContent.split('\n').filter(Boolean).map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        }).filter(Boolean);
        allEntries = allEntries.concat(archiveEntries);
      } catch (e) {
        console.warn(`Failed to read archive ${archiveFile}:`, e.message);
      }
    });
    
    // Sort by timestamp
    allEntries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    const exportData = {
      loopType: loopType,
      exportTimestamp: new Date().toISOString(),
      totalEntries: allEntries.length,
      entries: allEntries
    };
    
    fs.writeFileSync(outputFile, JSON.stringify(exportData, null, 2));
    
    if (h3xbaseConfig.verbose) {
      console.log(`[H3Xbase] Exported ${allEntries.length} ${loopType} entries to ${outputFile}`);
    }
    
    return true;
  } catch (e) {
    console.error(`Failed to export ${loopType} archive:`, e.message);
    return false;
  }
}

function importLoopTypeArchive(archiveFile, options = {}) {
  const { merge = true, validate = true, updateCounters = true } = options;
  
  try {
    if (!fs.existsSync(archiveFile)) {
      console.error(`Archive file not found: ${archiveFile}`);
      return false;
    }
    
    const archiveContent = fs.readFileSync(archiveFile, 'utf8');
    const archiveData = JSON.parse(archiveContent);
    
    // Validate archive format
    if (validate) {
      if (!archiveData.loopType || !archiveData.entries || !Array.isArray(archiveData.entries)) {
        console.error('Invalid archive format: missing loopType or entries array');
        return false;
      }
      
      const validLoopTypes = ['cFLup', 'fLup-out', 'fLup-recurse', 'fLuper'];
      if (!validLoopTypes.includes(archiveData.loopType)) {
        console.error(`Invalid loop type: ${archiveData.loopType}`);
        return false;
      }
    }
    
    const loopType = archiveData.loopType;
    const entries = archiveData.entries;
    
    if (h3xbaseConfig.verbose) {
      console.log(`[H3Xbase] Importing ${entries.length} entries for ${loopType} from ${archiveFile}`);
    }
    
    // Determine target log file
    let targetLogFile;
    switch (loopType) {
      case 'cFLup': targetLogFile = CFLUP_LOG; break;
      case 'fLup-out': targetLogFile = FLUPOUT_LOG; break;
      case 'fLup-recurse': targetLogFile = FLUPRECURSE_LOG; break;
      case 'fLuper': targetLogFile = FLUPER_LOG; break;
    }
    
    // Create backup of current log if merging
    if (merge && fs.existsSync(targetLogFile)) {
      const backupName = `${targetLogFile}.backup-${new Date().toISOString().replace(/[:.]/g, '-')}`;
      fs.copyFileSync(targetLogFile, backupName);
      if (h3xbaseConfig.verbose) {
        console.log(`[H3Xbase] Created backup: ${backupName}`);
      }
    }
    
    // Import entries
    let importedCount = 0;
    let maxInstanceId = 0;
    
    entries.forEach(entry => {
      // Update virtual state
      switch (loopType) {
        case 'cFLup':
          if (!flupN.cFlupInstances[entry.instanceId]) {
            flupN.cFlupInstances[entry.instanceId] = {
              created: entry.timestamp,
              amendments: []
            };
          }
          flupN.cFlupInstances[entry.instanceId].amendments.push(entry);
          
          // Track highest instance ID for counter update
          if (updateCounters && entry.instanceId) {
            const idMatch = entry.instanceId.match(/cFLup-(\d+)/);
            if (idMatch) {
              maxInstanceId = Math.max(maxInstanceId, parseInt(idMatch[1]));
            }
          }
          break;
          
        case 'fLup-out':
          if (!flupN.fLupOutState.amendments) flupN.fLupOutState.amendments = [];
          flupN.fLupOutState.amendments.push(entry);
          break;
          
        case 'fLup-recurse':
          if (!flupN.fLupRecurseState.amendments) flupN.fLupRecurseState.amendments = [];
          flupN.fLupRecurseState.amendments.push(entry);
          break;
          
        case 'fLuper':
          if (!flupN.fLuperState.amendments) flupN.fLuperState.amendments = [];
          flupN.fLuperState.amendments.push(entry);
          break;
      }
      
      // Add to main amendments for backward compatibility
      flupN.amendments.push({
        ...entry,
        imported: true,
        importTimestamp: new Date().toISOString(),
        importSource: archiveFile
      });
      
      // Write to target log file
      if (merge) {
        fs.appendFileSync(targetLogFile, JSON.stringify(entry) + '\n');
      }
      
      importedCount++;
    });
    
    // Update cFLup counter if importing cFLup data
    if (updateCounters && loopType === 'cFLup' && maxInstanceId > 0) {
      cFlupCounter = Math.max(cFlupCounter, maxInstanceId + 1);
      if (h3xbaseConfig.verbose) {
        console.log(`[H3Xbase] Updated cFLup counter to: ${cFlupCounter}`);
      }
    }
    
    // If not merging, replace the entire log file
    if (!merge) {
      const logContent = entries.map(entry => JSON.stringify(entry)).join('\n') + '\n';
      fs.writeFileSync(targetLogFile, logContent);
    }
    
    if (h3xbaseConfig.verbose) {
      console.log(`[H3Xbase] Successfully imported ${importedCount} entries for ${loopType}`);
      console.log(`[H3Xbase] Import mode: ${merge ? 'merge' : 'replace'}`);
    }
    
    return true;
    
  } catch (e) {
    console.error(`Failed to import archive ${archiveFile}:`, e.message);
    return false;
  }
}

function importMultipleArchives(archiveFiles, options = {}) {
  const results = {};
  let totalImported = 0;
  
  archiveFiles.forEach(archiveFile => {
    console.log(`\nImporting: ${archiveFile}`);
    const success = importLoopTypeArchive(archiveFile, options);
    results[archiveFile] = success;
    if (success) {
      totalImported++;
    }
  });
  
  console.log(`\n--- Import Summary ---`);
  console.log(`Total files processed: ${archiveFiles.length}`);
  console.log(`Successfully imported: ${totalImported}`);
  console.log(`Failed: ${archiveFiles.length - totalImported}`);
  
  if (totalImported > 0) {
    console.log('\nRun "node v-merger.js flup-n-summary" to see updated status');
  }
  
  return results;
}

function validateArchiveIntegrity(archiveFile) {
  try {
    const archiveContent = fs.readFileSync(archiveFile, 'utf8');
    const archiveData = JSON.parse(archiveContent);
    
    console.log(`--- Archive Validation: ${archiveFile} ---`);
    console.log(`Loop Type: ${archiveData.loopType}`);
    console.log(`Export Date: ${archiveData.exportTimestamp}`);
    console.log(`Total Entries: ${archiveData.totalEntries}`);
    console.log(`Actual Entries: ${archiveData.entries?.length || 0}`);
    
    // Validate entries
    let validEntries = 0;
    let invalidEntries = 0;
    const missingFields = new Set();
    
    if (archiveData.entries) {
      archiveData.entries.forEach((entry, index) => {
        const requiredFields = ['timestamp', 'loopType', 'summary'];
        let entryValid = true;
        
        requiredFields.forEach(field => {
          if (!entry[field]) {
            missingFields.add(field);
            entryValid = false;
          }
        });
        
        if (entryValid) {
          validEntries++;
        } else {
          invalidEntries++;
          console.log(`  Entry ${index + 1}: Missing fields`);
        }
      });
    }
    
    console.log(`Valid Entries: ${validEntries}`);
    console.log(`Invalid Entries: ${invalidEntries}`);
    
    if (missingFields.size > 0) {
      console.log(`Missing Fields Found: ${Array.from(missingFields).join(', ')}`);
    }
    
    // Check for instance ID patterns
    if (archiveData.loopType === 'cFLup') {
      const instanceIds = archiveData.entries
        ?.map(entry => entry.instanceId)
        .filter(Boolean);
      const uniqueInstances = [...new Set(instanceIds)];
      console.log(`Unique cFLup Instances: ${uniqueInstances.length}`);
      console.log(`Instance IDs: ${uniqueInstances.join(', ')}`);
    }
    
    console.log('-----------------------------------');
    
    return invalidEntries === 0;
    
  } catch (e) {
    console.error(`Failed to validate archive ${archiveFile}:`, e.message);
    return false;
  }
}

// --- Enhanced Archive Management ---
