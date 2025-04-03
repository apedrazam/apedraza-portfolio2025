const fs = require("fs");
const Image = require("@11ty/eleventy-img");
const path = require("path");

// Image shortcode for optimized images - skip SVGs to preserve animations
async function imageShortcode(src, alt, sizes, classList) {
  // Check if this is a critical image that shouldn't be lazy loaded
  const isCriticalImage = src.includes('-bg-block') || 
                         (classList && classList.includes('case-study__landing-media'));
  
  // Skip processing for SVG files to preserve animations
  if (src.toLowerCase().endsWith('.svg')) {
    // SVGs are copied to the img directory without path conversion
    // so we should use the same path structure
    const svgSrc = src;
    return `<img src="${svgSrc}" alt="${alt || ''}" ${sizes ? `sizes="${sizes}"` : ''} ${classList ? `class="${classList}"` : ''} ${!isCriticalImage ? 'loading="lazy"' : ''}>`;
  }

  try {
    // Special handling for about animation images - just return them directly, no processing
    if (src.includes('/about/')) {
      const aboutSrc = src.replace(/^\/assets\/images\//, '/assets/img/');
      return `<img src="${aboutSrc}" alt="${alt || ''}" ${sizes ? `sizes="${sizes}"` : ''} ${classList ? `class="${classList}"` : ''} ${!isCriticalImage ? 'loading="lazy"' : ''}>`;
    }

    // Make sure we're looking in the right directory - use assets/images not assets/img
    // Convert any references to assets/img back to assets/images for source
    let imageSrc = src.replace(/^\/assets\/img\//, '/assets/images/');
    
    // Remove leading slash if present to make the path relative
    const normalizedSrc = imageSrc.startsWith('/') ? imageSrc.substring(1) : imageSrc;
    
    // Use the same widths for all images except SVGs and about images
    const widths = [300, 600, 900, 1200, 2000];
    
    // Process images with Eleventy Image
    let metadata = await Image(normalizedSrc, {
      widths: widths,
      formats: ["webp"],
      outputDir: "./_site/assets/img/",
      urlPath: "/assets/img/",
      filenameFormat: function (id, src, width, format, options) {
        const extension = path.extname(src);
        const name = path.basename(src, extension);
        return `${name}-${width}w.${format}`;
      },
      sharpOptions: {
        quality: 100
      }
    });

    let imageAttributes = {
      alt,
      sizes,
      decoding: "async",
      class: classList
    };
    
    // Only add lazy loading for non-critical images
    if (!isCriticalImage) {
      imageAttributes.loading = "lazy";
    }

    return Image.generateHTML(metadata, imageAttributes);
  } catch (e) {
    console.error(`Error processing image: ${src}`, e);
    // Fallback to original source but with updated path
    const fallbackSrc = src.replace(/^\/assets\/images\//, '/assets/img/');
    return `<img src="${fallbackSrc}" alt="${alt || ''}" ${sizes ? `sizes="${sizes}"` : ''} ${classList ? `class="${classList}"` : ''} ${!isCriticalImage ? 'loading="lazy"' : ''}>`;
  }
}

// Video shortcode for responsive videos
function videoShortcode(src, alt, sizes, classList, attrs = {}) {
  // Check if this is a case study video that shouldn't be lazy loaded
  const isCriticalVideo = classList && classList.includes('case-study__landing-media');
  
  // Create a responsive video tag with appropriate attributes
  const attrStr = Object.entries(attrs)
    .map(([key, value]) => value === true ? key : `${key}="${value}"`)
    .join(' ');
  
  // Only add lazy loading for non-critical videos
  const loadingAttr = !isCriticalVideo ? 'loading="lazy"' : '';
  
  return `<video 
    src="${src}" 
    ${alt ? `alt="${alt}"` : ''} 
    ${classList ? `class="${classList}"` : ''} 
    ${sizes ? `sizes="${sizes}"` : ''}
    ${loadingAttr}
    ${attrStr}
  ></video>`;
}

module.exports = function(eleventyConfig) {
  // ✅ Copy SVGs to the img directory
  eleventyConfig.addPassthroughCopy({
    'assets/images/**/*.svg': 'assets/img' 
  });

  // ✅ Copy about animation images directly without processing
  eleventyConfig.addPassthroughCopy({
    'assets/images/about/*.webp': 'assets/img/about'
  });
  
  // ✅ Other assets that don't need processing
  eleventyConfig.addPassthroughCopy("assets/fonts");
  eleventyConfig.addPassthroughCopy("assets/videos");
  eleventyConfig.addPassthroughCopy("assets/js");
  eleventyConfig.addPassthroughCopy("assets/docs");
  eleventyConfig.addPassthroughCopy(".htaccess");

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

  // Add image shortcode
  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
  eleventyConfig.addJavaScriptFunction("image", imageShortcode);
  
  // Add video shortcode
  eleventyConfig.addNunjucksShortcode("video", videoShortcode);
  eleventyConfig.addJavaScriptFunction("video", videoShortcode);

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
