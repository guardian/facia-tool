import prod from './webpack.config.prod';
const path = require('path');

export default {
  ...prod,
  output: {
    path: path.resolve(__dirname, '../../public/client-v2/dist-prototype'),
    filename: 'app.bundle.js'
  }
};
