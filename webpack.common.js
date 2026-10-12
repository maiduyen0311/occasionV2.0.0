const path = require('path');

// Theme JavaScript bundle: common/js/common.js (+ modules) → assets/common.js.
// Vanilla ES modules only — styles are compiled separately by scripts/sass-build.js.

module.exports = {
  entry: {
    common: './common/js/common.js',
  },
  output: {
    path: path.join(__dirname, 'assets'),
    filename: '[name].js',
  },
  optimization: {
    splitChunks: false,
  },
  performance: {
    hints: false,
  },
};
