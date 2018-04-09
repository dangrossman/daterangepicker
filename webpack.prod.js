const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const extractSass = new ExtractTextPlugin({
  filename: "daterangepicker.css",
});

const config = {
  entry: './src/index.js',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: extractSass.extract({
            use: [{
              loader: "css-loader" // translates CSS into CommonJS
            }, {
              loader: "sass-loader" // compiles Sass to CSS
            }],
            fallback: "style-loader"
        })
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    extractSass,
    new UglifyJSPlugin()
  ],
   output: {
    filename: 'daterangepicker.min.js',
    path: path.resolve(__dirname, 'dist')
  }
};

module.exports = config;
