const 
webpack = require('webpack'),
path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: ['./src/scripts/internals/Application.ts'],
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].bundle.js',
    chunkFilename: '[name].chunk.js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [{ test: /\.tsx?$/, include: path.join(__dirname, '../src'), loader: 'ts-loader' }]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          filename: '[name].bundle.js'
        }
      }
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      System: ['System', 'System']
    }),
    new HtmlWebpackPlugin({ gameName: 'My Phaser Game', template: 'src/index.html' }),
    new CopyWebpackPlugin({
      patterns: [
      { from: 'src/assets', to: 'assets' },
      { from: 'src/favicon.ico', to: '' }

    ]})
  ]
}
