module.exports = {
  plugins: [
    require('autoprefixer'),
    require('cssnano')({
      preset: ['advanced', {
        discardComments: {
          removeAll: true,
        },
        reduceIdents: false,
        zindex: false,
        colormin: true,
        minifyFontValues: true,
        normalizeWhitespace: true
      }]
    })
  ]
}; 