/**
 * BitBurner API Adapter
 * Provides a compatibility layer so doom.js works in both BitBurner and browser environments
 */

console.log('Adapter loading...');

// Detect environment
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
const isBitBurner = typeof ns !== 'undefined' && ns && typeof ns.read === 'function';

console.log('Is Browser:', isBrowser);
console.log('Is BitBurner:', isBitBurner);

// GitHub raw content URLs for fetching files
// (For testing you can point the page at another copy of the game files with ?base=<url>, e.g. a local web server.)
const GITHUB_RAW = (new URLSearchParams(location.search).get('base') || 'https://raw.githubusercontent.com/Darxide777/Bitburner-Doom/main').replace(/\/$/, '');

// Shows a status line on the page while the (large) game files download. Safe to call before the page has the element.
function status(msg) {
  console.log('[status]', msg);
  const el = document.getElementById('status');
  if (el) el.textContent = msg;
}

// File cache to avoid repeated fetches
const fileCache = {};

/**
 * Fetch a file from GitHub
 */
async function fetchFromGitHub(filename) {
  if (fileCache[filename]) return fileCache[filename];
  const response = await fetch(`${GITHUB_RAW}/${filename}`);
  if (!response.ok) throw new Error(`Could not download ${filename} (HTTP ${response.status})`);
  const content = await response.text();
  fileCache[filename] = content;
  console.log('Fetched and cached:', filename, 'size:', content.length);
  return content;
}

/**
 * Pre-load every data file the game reads with ns.read(): the map, the sprites, the sounds, and any extra level maps
 * that doom.js lists (the `map: 'something.txt'` entries). Missing files stop the game with a clear message instead of
 * starting a broken game (no sprites / no sound).
 */
async function preloadFiles(code) {
  const maps = new Set(['map.txt']);
  for (const m of code.matchAll(/map:\s*'([^']+\.txt)'/g)) maps.add(m[1]);
  status('Loading maps...');
  for (const f of maps) await fetchFromGitHub(f);
  status('Loading sprites...');
  await fetchFromGitHub('sprites.json');
  status('Loading sounds (about 24 MB, the first time only)...');
  await fetchFromGitHub('audio.json');
  status('');
}

/**
 * Create a mock ns object for browser environment
 */
async function createMockNs(code) {
  await preloadFiles(code);

  return {
    disableLog: () => {},
    
    // The game's terminal messages go to the console. (The "new version available, run install.js" notice is for the
    // Bitburner version; this page always loads the newest code, so it is dropped.)
    tprint: (msg) => {
      if (/run install\.js/i.test(String(msg))) return;
      console.log('[TPRINT]', msg);
    },
    print: (msg) => console.log('[PRINT]', msg),
    // Cheats and options: in Bitburner they are flags (run doom.js --godmode). Here they come from the page address, e.g.
    //   index.html?godmode&infiniteammo   (a flag counts as on unless written as =0 or =false, e.g. ?godmode=0)
    // The schema is the game's own list of flags, so new flags work without changing this file.
    flags: (schema) => {
      const q = new URLSearchParams(location.search);
      const on = k => q.has(k) && !['0', 'false', 'off', 'no'].includes(q.get(k).toLowerCase());
      return { ...Object.fromEntries(schema.map(([k, v]) => [k, typeof v === 'boolean' ? on(k) : (q.has(k) ? q.get(k) : v)])), _: [] };
    },
    atExit: () => {},
    
    read: (filename) => {
      // Return synchronously from cache
      if (fileCache[filename]) {
        return fileCache[filename];
      }
      console.warn(`File not cached: ${filename}`);
      return '';
    },
    
    write: () => {},
    
    exec: () => {},
    
    sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    
    wget: async (url, filename) => {
      try {
        const response = await fetch(url);
        const content = await response.text();
        fileCache[filename] = content;
        return true;
      } catch (error) {
        console.error(`Error downloading ${filename}:`, error);
        return false;
      }
    }
  };
}

/**
 * Get or create the ns object
 */
async function getNs(code) {
  console.log('Getting ns...');
  if (isBitBurner) {
    console.log('Using BitBurner ns');
    return ns; // Use BitBurner's native ns
  } else if (isBrowser) {
    console.log('Creating mock ns for browser');
    return await createMockNs(code); // Create mock ns for browser
  } else {
    throw new Error('Unknown environment: not BitBurner and not Browser');
  }
}

/**
 * Clean and execute doom.js code
 */
async function executeDoomJs() {
  try {
    console.log('executeDoomJs called');
    console.log('Fetching doom.js...');
    
    // Fetch doom.js
    status('Loading game...');
    const response = await fetch(`${GITHUB_RAW}/doom.js`);
    if (!response.ok) throw new Error(`Could not download doom.js (HTTP ${response.status})`);
    let code = await response.text();
    
    console.log('doom.js fetched, size:', code.length);
    console.log('Removing export keyword...');
    
    // Remove the "export" keyword to make it work in eval
    code = code.replace(/^export\s+async\s+function\s+main/m, 'async function main');   // anchored to the line start: doom.js's header comment also contains this text
    
    console.log('Getting ns object...');
    
    // Get the ns object (which preloads files)
    const ns = await getNs(code);
    
    console.log('Creating sandbox...');
    
    // Create a sandbox with the ns object and common functions
    const sandbox = {
      ns,
      Math,
      Date,
      String,
      Array,
      Object,
      JSON,
      console,
      setTimeout,
      setInterval,
      clearTimeout,
      clearInterval,
      fetch,
      AudioContext: window.AudioContext || window.webkitAudioContext,
      document,
      window,
      eval: eval,
    };
    
    console.log('Executing doom.js code...');
    
    // Execute the code in the sandbox
    const fn = new Function(...Object.keys(sandbox), code + '; return main;');
    const main = fn(...Object.values(sandbox));
    
    console.log('Main function created, type:', typeof main);
    console.log('Running main function...');
    
    // Run the main function
    await main(ns);
    
    console.log('Game finished');
    
  } catch (error) {
    console.error('Failed to execute game:', error);
    throw error;
  }
}

// Export for use in HTML
window.executeDoomJs = executeDoomJs;
console.log('Adapter loaded, executeDoomJs available:', typeof window.executeDoomJs);
