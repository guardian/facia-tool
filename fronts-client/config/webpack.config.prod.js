const common = require('./webpack.config.common');

module.exports = {
  ...common,
  devtool: 'source-map',
  mode: 'production'
};
