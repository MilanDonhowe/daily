/**
    Filename: webpack.config.js
    Description: This configures the webpack bundler to process all of our
                 static frontend files (html/css/javascript) into compact
                 production-ready formats.
*/
const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, path.join('src', 'main.js')),
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'main.js',
  },
  module: {
      rules: [
          // Setup Post CSS loader (taken from PostCSS docs)
          {
              test: /\.css$/,
              exclude: /node_modules/,
              use: [
                  {
                      loader: 'style-loader',
                  },
                  {
                      loader: 'css-loader',
                      options: {
                          importLoaders: 1
                      }
                  },
                  {
                      loader: 'postcss-loader'
                  }
              ]
          },
          // Handlebars template loader
          // see https://github.com/pcardune/handlebars-loader for config info
          {
              test: /\.hbs$/,
              loader: 'handlebars-loader'
          },
      ]
  },
  mode: 'development' // change to "production" l8r
};