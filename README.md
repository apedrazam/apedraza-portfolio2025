# APEDRAZA.NET Portfolio

This repository contains the source code for Adrian Pedraza's professional portfolio website.

## Technologies

- 11ty Static Site Generator
- SASS for CSS preprocessing
- Rollup for JavaScript bundling
- Responsive images processing with @11ty/eleventy-img

## Image Handling

The site uses a streamlined image optimization approach:

- Source images are stored in `assets/images/` including SVGs and original WEBPs
- All images are output to a single directory: `_site/assets/img/`
- Special handling for different image types:
  - SVG files are copied directly to preserve animations and interactions
  - About page animation images are copied without responsive variants to maintain animation compatibility
  - Regular images are processed with responsive variants and appropriate `srcset` attributes
  - A post-build script ensures all references use the new paths

## Build Commands

- `npm run dev` - Start development server
- `npm run build` - Build the site for production
- `npm run clean-build` - Clean the build directory and rebuild everything

## Assets Structure

```
_site/assets/
├── img/           # All images (SVGs, about animations, responsive variants)
│   └── about/     # About page animation images
├── css/           # Compiled CSS
├── js/            # Bundled JavaScript
├── fonts/         # Web fonts
└── videos/        # Video files
```

## Notes

- SVG files are preserved as-is to maintain animations and interactivity
- WEBP format is used for raster images with responsive variants
- Lazy loading is enabled for non-critical images
- Critical images (hero, case study landing) have lazy loading disabled for immediate rendering 