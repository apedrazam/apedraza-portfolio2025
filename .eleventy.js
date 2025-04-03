const fs = require("fs");
const Image = require("@11ty/eleventy-img");
const path = require("path");

// Image shortcode for optimized images - skip SVGs to preserve animations
async function imageShortcode(src, alt, sizes) {
  // Skip processing for SVG files to preserve animations
  if (src.toLowerCase().endsWith('.svg')) {
    return `<img src="${src}" alt="${alt || ''}" ${sizes ? `sizes="${sizes}"` : ''} loading="lazy">`;
  }

  try {
    let metadata = await Image(src, {
      widths: [300, 600, 900, 1200],
      formats: ["webp", "jpeg"],
      outputDir: "./_site/assets/img/",
      urlPath: "/assets/img/",
      filenameFormat: function (id, src, width, format, options) {
        const extension = path.extname(src);
        const name = path.basename(src, extension);
        return `${name}-${width}w.${format}`;
      },
      sharpOptions: {
        quality: 80
      }
    });

    let imageAttributes = {
      alt,
      sizes,
      loading: "lazy",
      decoding: "async",
    };

    return Image.generateHTML(metadata, imageAttributes);
  } catch (e) {
    console.error(`Error processing image: ${src}`, e);
    return `<img src="${src}" alt="${alt || ''}" ${sizes ? `sizes="${sizes}"` : ''} loading="lazy">`;
  }
}

module.exports = function(eleventyConfig) {
  // ✅ Passthrough copy for assets 
  eleventyConfig.addPassthroughCopy("assets/images");
  eleventyConfig.addPassthroughCopy("assets/fonts");
  eleventyConfig.addPassthroughCopy("assets/videos");
  eleventyConfig.addPassthroughCopy("assets/docs");
  eleventyConfig.addPassthroughCopy(".htaccess");
  
  // Custom bundle.js handling
  eleventyConfig.addPassthroughCopy("_site/assets/js/bundle.js");
  
  // ✅ Watch for changes in specific folders
  eleventyConfig.addWatchTarget("./assets/");
  eleventyConfig.addWatchTarget("./_includes/");
  eleventyConfig.addWatchTarget("./content/");
  eleventyConfig.addWatchTarget("./pages/");

  // ✅ Custom filters
  eleventyConfig.addFilter("limit", (array, limit) => array.slice(0, limit));
  eleventyConfig.addFilter("filterByCategory", (array, category) => array.filter(item => item.data.category === category));
  eleventyConfig.addFilter("sortByOrder", (array) => array.sort((a, b) => a.data.order - b.data.order));
  eleventyConfig.addFilter("findIndex", (array, property, value) => array.findIndex(item => item.data[property] === value));

  // ✅ Enable deep merge of data
  eleventyConfig.setDataDeepMerge(true);

  // ✅ Add case studies collection
  eleventyConfig.addCollection("caseStudies", function(collectionApi) {
    return collectionApi.getFilteredByGlob("pages/*.njk").filter(item => item.data.category === "Case Study");
  });

  // ✅ Compute correct permalink for homepage & case studies
  eleventyConfig.addGlobalData("eleventyComputed", {
    permalink: data => {
      if (data.page.filePathStem === "/index") {
        return "/index.html"; // ✅ Fixes homepage issue
      } else if (data.category === "Case Study") {
        let basePath = data.page.filePathStem.replace(/^\/pages\//, ""); // Remove "/pages/"
        return `/case-study/${basePath}/index.html`; // ✅ Ensures case study URLs are correct
      } else if (data.page.filePathStem === "/about" || data.page.filePathStem === "/privacy-policy") {
        // ✅ Create clean URLs for about and privacy-policy pages
        return `${data.page.filePathStem}/index.html`;
      }
      return data.permalink || `${data.page.filePathStem}.html`; // ✅ Ensures default pages use `.html`
    }
  });

  // ✅ 404 page handling
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function(err, bs) {
        bs.addMiddleware("*", (req, res) => {
          const content404 = fs.readFileSync('_site/404.html');
          res.writeHead(404, { "Content-Type": "text/html; charset=UTF-8" });
          res.write(content404);
          res.end();
        });
      }
    }
  });

  // Copy bundle.js post-build to ensure it's in the output
  eleventyConfig.on('afterBuild', () => {
    // Ensure the _site/assets/js directory exists
    if (!fs.existsSync('_site/assets/js')) {
      fs.mkdirSync('_site/assets/js', { recursive: true });
    }
    
    // Remove nested _site directory if it exists
    if (fs.existsSync('_site/_site')) {
      console.log('Found nested _site directory, removing...');
      try {
        fs.rmSync('_site/_site', { recursive: true, force: true });
        console.log('Successfully removed nested _site directory');
      } catch (err) {
        console.error('Error removing nested _site directory:', err);
      }
    }
    
    // Copy bundle.js from the source if it exists
    if (fs.existsSync('_site/assets/js/bundle.js')) {
      console.log('bundle.js is already in the output directory');
    } else if (fs.existsSync('assets/js/bundle.js')) {
      try {
        fs.copyFileSync('assets/js/bundle.js', '_site/assets/js/bundle.js');
        console.log('Successfully copied bundle.js to output directory');
      } catch (err) {
        console.error('Error copying bundle.js:', err);
      }
    } else {
      console.warn('bundle.js not found in source or output directory!');
    }
  });

  // Add image shortcode
  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
  eleventyConfig.addJavaScriptFunction("image", imageShortcode);

  // ✅ Return Eleventy configuration
  return {
    dir: {
      input: "pages",   // ✅ Keep using "pages" as input
      output: "_site",
      includes: "../_includes",
      layouts: "../_layouts"
    },
    templateFormats: ["html", "njk", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
