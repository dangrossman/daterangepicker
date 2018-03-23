const path = require('path');

const config = {
  entry: './src/index.js',
  output: {
    filename: 'daterangepicker.js',
    path: path.resolve(__dirname, 'dist')
  },
  mode: 'development',
};

module.exports = config;
