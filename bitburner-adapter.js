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
const GITHUB_RAW = 'https://raw.githubusercontent.com/Darxide777/Bitburner-Doom/main';

// File cache to avoid repeated fetches
const fileCache = {};

/**
 * Fetch a file from GitHub
 */
async function fetchFromGitHub(filename) {
  console.log('Fetching:', filename);
  if (fileCache[filename]) {
    console.log('Found in cache:', filename);
    return fileCache[filename];
  }
  
  try {
    const response = await fetch(`${GITHUB_RAW}/${filename}`);
    if (!response.ok) throw new Error(`Failed to fetch ${filename}`);
    const content = await response.text();
    fileCache[filename] = content;
    console.log('Fetched and cached:', filename, 'size:', content.length);
    return content;
  } catch (error) {
    console.error(`Error fetching ${filename}:`, error);
    return '';
  }
}

/**
 * Pre-load map and audio files
 */
async function preloadFiles() {
  console.log('Preloading files...');
  await fetchFromGitHub('map.txt');
  await fetchFromGitHub('audio.json');
  console.log('Files preloaded');
}

/**
 * Create a mock ns object for browser environment
 */
async function createMockNs() {
  console.log('Creating mock ns...');
  // Pre-load files first
  await preloadFiles();
  
  return {
    disableLog: () => {},
    
    tprint: (msg) => {
      console.log('[TPRINT]', msg);
    },
    
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
async function getNs() {
  console.log('Getting ns...');
  if (isBitBurner) {
    console.log('Using BitBurner ns');
    return ns; // Use BitBurner's native ns
  } else if (isBrowser) {
    console.log('Creating mock ns for browser');
    return await createMockNs(); // Create mock ns for browser
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
    const response = await fetch('https://raw.githubusercontent.com/Darxide777/Bitburner-Doom/main/doom.js');
    let code = await response.text();
    
    console.log('doom.js fetched, size:', code.length);
    console.log('Removing export keyword...');
    
    // Remove the "export" keyword to make it work in eval
    code = code.replace(/export\s+async\s+function\s+main/, 'async function main');
    
    console.log('Getting ns object...');
    
    // Get the ns object (which preloads files)
    const ns = await getNs();
    
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
