import prod from './webpack.config.prod';
const path = require('path');
const webpack = require('webpack');

const definePlugin = new webpack.DefinePlugin({
  'process.env.APP_URL_PREFIX': 'v2-prototype'
});

export default {
  ...prod,
  output: {
    path: path.resolve(__dirname, '../../public/client-v2/dist-prototype'),
    filename: 'app.bundle.js'
  },
  plugins: [definePlugin]
};
