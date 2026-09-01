/**
 * BitBurner API Adapter
 * Provides a compatibility layer so doom.js works in both BitBurner and browser environments
 */

// Detect environment
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
const isBitBurner = typeof ns !== 'undefined' && ns && typeof ns.read === 'function';

// GitHub raw content URLs for fetching files
const GITHUB_RAW = 'https://raw.githubusercontent.com/Darxide777/Bitburner-Doom/main';

// File cache to avoid repeated fetches
const fileCache = {};

/**
 * Fetch a file from GitHub
 */
async function fetchFromGitHub(filename) {
  if (fileCache[filename]) {
    return fileCache[filename];
  }
  
  try {
    const response = await fetch(`${GITHUB_RAW}/${filename}`);
    if (!response.ok) throw new Error(`Failed to fetch ${filename}`);
    const content = await response.text();
    fileCache[filename] = content;
    return content;
  } catch (error) {
    console.error(`Error fetching ${filename}:`, error);
    return '';
  }
}

/**
 * Create a mock ns object for browser environment
 */
async function createMockNs() {
  return {
    disableLog: () => {},
    
    tprint: (msg) => {
      console.log(msg);
    },
    
    read: async (filename) => {
      if (isBrowser) {
        return await fetchFromGitHub(filename);
      }
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
  if (isBitBurner) {
    return ns; // Use BitBurner's native ns
  } else if (isBrowser) {
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
    // Fetch doom.js
    const response = await fetch('https://raw.githubusercontent.com/Darxide777/Bitburner-Doom/main/doom.js');
    let code = await response.text();
    
    // Remove the "export" keyword to make it work in eval
    code = code.replace(/export\s+async\s+function\s+main/, 'async function main');
    
    // Get the ns object
    const ns = await getNs();
    
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
      eval: eval, // Allow eval if needed within the code
    };
    
    // Execute the code in the sandbox
    const fn = new Function(...Object.keys(sandbox), code + '; return main;');
    const main = fn(...Object.values(sandbox));
    
    // Run the main function
    await main(ns);
    
  } catch (error) {
    console.error('Failed to execute game:', error);
    throw error;
  }
}

// Export for use in HTML
window.executeDoomJs = executeDoomJs;
