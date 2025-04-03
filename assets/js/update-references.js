const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Map of the files we need to update (processed files in _site directory)
const processHtmlFiles = () => {
  console.log('🔄 Updating image references in HTML files...');
  
  // Get all the HTML files in the _site directory
  const htmlFiles = glob.sync('_site/**/*.html');
  
  // Count of updates made
  let totalUpdates = 0;
  
  htmlFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Original content
    const originalContent = content;
    
    // Replace all references to "/assets/images/" with "/assets/img/"
    // Avoid duplicating paths by checking if path doesn't already start with /assets/img/
    content = content.replace(/(['"]\/)assets\/images\//g, '$1assets/img/');
    
    // Count updates in this file
    const fileUpdated = content !== originalContent;
    if (fileUpdated) totalUpdates++;
    
    // Save the file if it was updated
    if (fileUpdated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Updated ${filePath} with new image references`);
    }
  });
  
  console.log(`🎉 Updated ${totalUpdates} files successfully!`);
};

// Execute the update
processHtmlFiles(); 