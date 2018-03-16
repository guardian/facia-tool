import path from 'path';
import common from './webpack.config.common.js';

export default {
  ...common,
  mode: 'development',
  devServer: {
    contentBase: path.join(__dirname, '../'),
    compress: true,
    port: 9001,
    publicPath: '/dist/'
  }
};
