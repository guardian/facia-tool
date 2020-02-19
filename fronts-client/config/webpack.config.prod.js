import common from './webpack.config.common';

export default {
  ...common,
  devtool: 'source-map',
  mode: 'production'
};
