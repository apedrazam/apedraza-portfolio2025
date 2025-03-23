const fs = require("fs");

module.exports = function(eleventyConfig) {
  // ✅ Passthrough copy for assets
  eleventyConfig.addPassthroughCopy("assets/images");
  eleventyConfig.addPassthroughCopy("assets/fonts");
  eleventyConfig.addPassthroughCopy("assets/videos");
  eleventyConfig.addPassthroughCopy("assets/js");

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

  // Add passthrough copy for flashcard pages
  eleventyConfig.addPassthroughCopy({
    "pages/case-studies/devex-design-process/flashcard.njk": "case-study/devex-design-process/flashcard.html",
    "pages/case-studies/devex-job-posting/flashcard.njk": "case-study/devex-job-posting/flashcard.html",
    "pages/case-studies/devex-design-system/flashcard.njk": "case-study/devex-design-system/flashcard.html",
    "pages/case-studies/adamo-wholesale-billing/flashcard.njk": "case-study/adamo-wholesale-billing/flashcard.html"
  });

  // ✅ Compute correct permalink for homepage & case studies
  eleventyConfig.addGlobalData("eleventyComputed", {
    permalink: data => {
      if (data.page.filePathStem === "/index") {
        return "/index.html"; // ✅ Fixes homepage issue
      } else if (data.category === "Case Study") {
        let basePath = data.page.filePathStem.replace(/^\/pages\//, ""); // Remove "/pages/"
        return `/case-study/${basePath}/index.html`; // ✅ Ensures case study URLs are correct
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
