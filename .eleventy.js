const fs = require("fs");

module.exports = function(eleventyConfig) {
  // Passthrough copy for assets
  eleventyConfig.addPassthroughCopy("assets/images");
  eleventyConfig.addPassthroughCopy("assets/fonts");
  eleventyConfig.addPassthroughCopy("assets/videos");
  eleventyConfig.addPassthroughCopy("assets/js");
  // CSS is now compiled from SCSS, no need to copy assets/css
  // eleventyConfig.addPassthroughCopy("assets/css");
  
  // Watch for changes
  eleventyConfig.addWatchTarget("./assets/");
  eleventyConfig.addWatchTarget("./_includes/");
  eleventyConfig.addWatchTarget("./content/");
  eleventyConfig.addWatchTarget("./pages/");
  
  // Custom filters
  eleventyConfig.addFilter("limit", function(array, limit) {
    return array.slice(0, limit);
  });

  // Filter by category
  eleventyConfig.addFilter("filterByCategory", function(array, category) {
    return array.filter(item => item.data.category === category);
  });

  // Sort by order
  eleventyConfig.addFilter("sortByOrder", function(array) {
    return array.sort((a, b) => a.data.order - b.data.order);
  });

  // Find index by property
  eleventyConfig.addFilter("findIndex", function(array, property, value) {
    return array.findIndex(item => item.data[property] === value);
  });
  
  // Enable deep merge of data
  eleventyConfig.setDataDeepMerge(true);

  // Add case studies collection
  eleventyConfig.addCollection("caseStudies", function(collectionApi) {
    return collectionApi.getFilteredByGlob("pages/*.njk").filter(item => item.data.category === "Case Study");
  });
  
  // Copy components to assets/components
  eleventyConfig.addPassthroughCopy({ "_includes/components/header.njk": "assets/components/header.html" });
  eleventyConfig.addPassthroughCopy({ "_includes/components/footer.njk": "assets/components/footer.html" });
  eleventyConfig.addPassthroughCopy({ "_includes/components/scroll-to-top.njk": "assets/components/scroll-to-top.html" });
  eleventyConfig.addPassthroughCopy({ "_includes/components/case-study-nav.njk": "assets/components/case-study-nav.html" });

  // Add passthrough copy for flashcard pages
  eleventyConfig.addPassthroughCopy({
    "pages/case-studies/devex-design-process/flashcard.njk": "case-study/devex-design-process/flashcard.html",
    "pages/case-studies/devex-job-posting/flashcard.njk": "case-study/devex-job-posting/flashcard.html",
    "pages/case-studies/devex-design-system/flashcard.njk": "case-study/devex-design-system/flashcard.html",
    "pages/case-studies/adamo-wholesale-billing/flashcard.njk": "case-study/adamo-wholesale-billing/flashcard.html"
  });

  // 404 page handling
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function(err, bs) {
        bs.addMiddleware("*", (req, res) => {
          const content404 = fs.readFileSync('_site/404.html');
          // Add 404 http status code
          res.writeHead(404, { "Content-Type": "text/html; charset=UTF-8" });
          res.write(content404);
          res.end();
        });
      }
    }
  });

  return {
    dir: {
      input: "pages",
      output: "_site",
      includes: "../_includes",
      layouts: "../_layouts"
    },
    templateFormats: ["html", "njk", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
}; 