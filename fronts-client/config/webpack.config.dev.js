const path = require('path');
const common = require('./webpack.config.common.js');

module.exports = {
  ...common,
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  devServer: {
    contentBase: path.join(__dirname, '../'),
    compress: true,
    port: 9001,
    publicPath: '/dist/'
  }
};
