const terser = require('@rollup/plugin-terser');
const fs = require('fs');
const path = require('path');

// List of files to include in the bundle in the correct order
const jsFiles = [
  'assets/js/header.js',
  'assets/js/cookie-consent.js', 
  'assets/js/scroll-to-top.js',
  'assets/js/svg-tilt.js',
  'assets/js/flashcards.js',
  'assets/js/about-animation.js',
  'assets/js/hero-animation.js',
  'assets/js/falling-hexes-bg.js',
  'assets/js/include-components.js',
  'assets/js/page-template.js',
  'assets/js/main.js',
  'assets/js/accordion.js'
  // Note: accordion.js has been moved to inline script
];

// Create a simple concatenation plugin
function concatFiles() {
  return {
    name: 'concat-files',
    generateBundle() {
      let code = '';
      
      // Read and concatenate each file
      jsFiles.forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          code += `/* ${path.basename(file)} */\n${content}\n\n`;
        } catch (err) {
          console.error(`Error reading file ${file}:`, err);
        }
      });
      
      // Add the concatenated code as an asset
      this.emitFile({
        type: 'asset',
        fileName: 'bundle.js',
        source: code
      });
    }
  };
}

// Plugin to clean up nested _site directory if it exists
function cleanNestedDir() {
  return {
    name: 'clean-nested-dir',
    writeBundle() {
      // Check if nested _site/_site exists and remove it
      if (fs.existsSync('_site/_site')) {
        console.log('Rollup: Found nested _site directory, removing...');
        try {
          fs.rmSync('_site/_site', { recursive: true, force: true });
        } catch (err) {
          console.error('Rollup: Error removing nested _site directory:', err);
        }
      }
    }
  };
}

module.exports = {
  input: 'fake-entry.js', // This won't be used, but rollup requires an input
  output: {
    dir: '_site/assets/js',
    format: 'iife' // Keep this as iife since we're just concatenating
  },
  plugins: [
    concatFiles(),
    terser({
      compress: {
        drop_console: false, // Keep console logs for debugging
        passes: 1, // Fewer optimization passes
        keep_fnames: true, // Keep function names
        keep_classnames: true // Keep class names
      },
      mangle: {
        keep_fnames: true // Don't mangle function names
      },
      format: {
        comments: 'some', // Keep some comments
        beautify: false // But still minify
      }
    }),
    cleanNestedDir()
  ]
};
