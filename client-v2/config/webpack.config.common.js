const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, '../../public/client-v2/dist'),
    filename: 'app.bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/, // regex to test the file's path against
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.js$/, // regex to test the file's path against
        use: 'eslint-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|otf)$/,
        loader: 'file-loader',
        options: {
          publicPath: '/assets/client-v2/dist/'
        }
      }
    ]
  },
  resolve: {
    modules: ['src', 'node_modules']
  }
};
